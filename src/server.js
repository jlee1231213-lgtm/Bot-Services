import express from "express";
import { Environment, EventName, LogLevel, Paddle } from "@paddle/paddle-node-sdk";
import crypto from "node:crypto";
import {
  createSession,
  deleteSession,
  getGuildSettings,
  getSession,
  isPremiumGuild,
  removePremiumGuild,
  setGuildSettings,
  setPremiumGuild,
} from "./store.js";

export function createServer() {
  const app = express();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  const siteUrl = process.env.PUBLIC_SITE_URL ?? "http://localhost:5500";
  const backendUrl = process.env.PUBLIC_BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

  app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", siteUrl);
    response.header("Access-Control-Allow-Credentials", "true");
    response.header("Access-Control-Allow-Headers", "Content-Type");
    response.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
    if (request.method === "OPTIONS") {
      response.sendStatus(204);
      return;
    }
    next();
  });

  app.get("/health", (_request, response) => {
    response.json({ ok: true, service: "logic-systems-bot" });
  });

  app.get("/debug/config", (_request, response) => {
    response.json({
      signedSessions: true,
      hasSessionSecret: Boolean(process.env.SESSION_SECRET),
      hasDiscordClientSecret: Boolean(process.env.DISCORD_CLIENT_SECRET),
      publicSiteUrl: siteUrl,
      publicBackendUrl: process.env.PUBLIC_BACKEND_URL ?? null,
    });
  });

  app.get("/", (_request, response) => {
    response
      .type("html")
      .send(`<p>Logic Systems backend is running. Open <a href="${siteUrl}">${siteUrl}</a> for the website.</p>`);
  });

  app.get("/auth/discord", (_request, response) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      response.status(500).send("DISCORD_CLIENT_ID is not configured.");
      return;
    }

    const requestBackendUrl = getRequestBackendUrl(_request, backendUrl);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${requestBackendUrl}/auth/discord/callback`,
      response_type: "code",
      scope: "identify guilds",
      prompt: "none",
    });

    response.redirect(`https://discord.com/oauth2/authorize?${params}`);
  });

  app.get("/auth/discord/callback", async (request, response) => {
    const code = request.query.code;
    if (!code) {
      response.status(400).send("Missing Discord OAuth code.");
      return;
    }

    try {
      const tokenData = await exchangeDiscordCode(code, getRequestBackendUrl(request, backendUrl));
      const [user, guilds] = await Promise.all([
        discordApi("/users/@me", tokenData.access_token),
        discordApi("/users/@me/guilds", tokenData.access_token),
      ]);

      const manageableGuilds = guilds.filter(canManageGuild).map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        owner: guild.owner,
      }));

      const session = {
        user: {
          id: user.id,
          username: user.username,
          globalName: user.global_name,
          avatar: user.avatar,
        },
        guilds: manageableGuilds,
      };
      const sessionId = createSignedSession(session);
      await createSession(sessionId, session);

      response.cookie("logic_session", sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      response.redirect(`${siteUrl}/#dashboard?session=${encodeURIComponent(sessionId)}`);
    } catch (error) {
      console.error("Discord OAuth failed", error);
      response
        .status(500)
        .type("html")
        .send(`<h1>Discord login failed</h1><pre>${escapeHtml(error.message)}</pre>`);
    }
  });

  app.post("/auth/logout", async (request, response) => {
    const sessionId = getCookie(request, "logic_session");
    if (sessionId) await deleteSession(sessionId);
    response.clearCookie("logic_session", { secure: true, sameSite: "none" });
    response.json({ ok: true });
  });

  app.get("/api/me", async (request, response) => {
    const session = await requireSession(request, response);
    if (!session) return;
    response.json({ user: session.user });
  });

  app.get("/api/guilds", async (request, response) => {
    const session = await requireSession(request, response);
    if (!session) return;

    const guilds = await Promise.all(
      session.guilds.map(async (guild) => ({
        ...guild,
        premium: await isPremiumGuild(guild.id),
      })),
    );
    response.json({ guilds });
  });

  app.get("/api/guilds/:guildId/settings", async (request, response) => {
    const session = await requireSession(request, response);
    if (!session) return;
    if (!session.guilds.some((guild) => guild.id === request.params.guildId)) {
      response.status(403).json({ error: "You cannot manage this server." });
      return;
    }

    response.json({
      premium: await isPremiumGuild(request.params.guildId),
      settings: (await getGuildSettings(request.params.guildId)) ?? defaultSettings,
    });
  });

  app.put("/api/guilds/:guildId/settings", express.json(), async (request, response) => {
    const session = await requireSession(request, response);
    if (!session) return;
    if (!session.guilds.some((guild) => guild.id === request.params.guildId)) {
      response.status(403).json({ error: "You cannot manage this server." });
      return;
    }
    if (!(await isPremiumGuild(request.params.guildId))) {
      response.status(402).json({ error: "Premium is required to edit embeds." });
      return;
    }

    const settings = sanitizeSettings(request.body);
    await setGuildSettings(request.params.guildId, settings);
    response.json({ ok: true, settings });
  });

  app.post("/api/premium/manual", express.json(), async (request, response) => {
    const { guildId, active = true } = request.body;
    if (!guildId) {
      response.status(400).json({ error: "guildId is required" });
      return;
    }

    if (active) {
      await setPremiumGuild(guildId, { source: "manual" });
    } else {
      await removePremiumGuild(guildId, { source: "manual" });
    }

    response.json({ ok: true, guildId, active });
  });

  app.post("/webhooks/paddle", express.raw({ type: "application/json" }), async (request, response) => {
    if (!webhookSecret) {
      response.status(500).json({ error: "PADDLE_WEBHOOK_SECRET is not configured" });
      return;
    }

    const paddle = new Paddle(undefined, {
      environment: Environment.production,
      logLevel: LogLevel.error,
    });

    let event;
    try {
      event = await paddle.webhooks.unmarshal(
        request.body.toString("utf8"),
        webhookSecret,
        request.headers["paddle-signature"],
      );
    } catch (error) {
      console.error("Invalid Paddle webhook signature", error);
      response.status(400).json({ error: "invalid webhook" });
      return;
    }

    const guildId = event.data?.customData?.guildId;

    if (!guildId) {
      console.log(`Paddle ${event.eventType} received without customData.guildId.`);
      response.json({ ok: true, ignored: true });
      return;
    }

    if (premiumActiveEvents.has(event.eventType)) {
      await setPremiumGuild(guildId, {
        source: "paddle",
        eventType: event.eventType,
        paddleId: event.data?.id,
      });
    }

    if (premiumInactiveEvents.has(event.eventType)) {
      await removePremiumGuild(guildId, {
        source: "paddle",
        eventType: event.eventType,
        paddleId: event.data?.id,
      });
    }

    response.json({ ok: true });
  });

  return app;
}

const defaultSettings = {
  embedTitle: "Session Startup",
  embedMessage: "A new roleplay session is starting. Join up and follow the server rules.",
  embedColor: "#3c43ec",
  footerText: "Logic Systems Premium",
  customEmbeds: true,
};

function sanitizeSettings(body) {
  return {
    embedTitle: cleanText(body.embedTitle, "Session Startup", 120),
    embedMessage: cleanText(body.embedMessage, "A new roleplay session is starting.", 1000),
    embedColor: /^#[0-9a-f]{6}$/i.test(body.embedColor) ? body.embedColor : "#3c43ec",
    footerText: cleanText(body.footerText, "Logic Systems Premium", 120),
    customEmbeds: Boolean(body.customEmbeds),
  };
}

function cleanText(value, fallback, maxLength) {
  const text = String(value ?? "").trim();
  return (text || fallback).slice(0, maxLength);
}

async function requireSession(request, response) {
  const sessionId = getBearerToken(request) ?? getCookie(request, "logic_session");
  const session = sessionId ? (verifySignedSession(sessionId) ?? await getSession(sessionId)) : null;
  if (!session) {
    response.status(401).json({ error: "Sign in with Discord first." });
    return null;
  }
  return session;
}

function getCookie(request, name) {
  const cookies = request.headers.cookie?.split(";").map((cookie) => cookie.trim()) ?? [];
  const prefix = `${name}=`;
  return cookies.find((cookie) => cookie.startsWith(prefix))?.slice(prefix.length);
}

function getBearerToken(request) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

function createSignedSession(session) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function verifySignedSession(token) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || signPayload(payload) !== signature) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function signPayload(payload) {
  const secret = process.env.SESSION_SECRET ?? process.env.DISCORD_CLIENT_SECRET;
  if (!secret) throw new Error("SESSION_SECRET or DISCORD_CLIENT_SECRET is required for dashboard sessions.");
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function getRequestBackendUrl(request, fallbackUrl) {
  if (process.env.PUBLIC_BACKEND_URL) return process.env.PUBLIC_BACKEND_URL;

  const host = request.get("x-forwarded-host") ?? request.get("host");
  const protocol = request.get("x-forwarded-proto") ?? request.protocol ?? "https";
  return host ? `${protocol}://${host}` : fallbackUrl;
}

async function exchangeDiscordCode(code, backendUrl) {
  if (!process.env.DISCORD_CLIENT_SECRET) {
    throw new Error("DISCORD_CLIENT_SECRET is not configured.");
  }

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: `${backendUrl}/auth/discord/callback`,
  });

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Discord token exchange failed: ${response.status} ${errorBody}`);
  }
  return response.json();
}

async function discordApi(path, accessToken) {
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Discord API failed: ${path} ${response.status} ${errorBody}`);
  }
  return response.json();
}

function canManageGuild(guild) {
  const permissions = BigInt(guild.permissions ?? "0");
  const manageGuild = 0x20n;
  const administrator = 0x8n;
  return guild.owner || (permissions & manageGuild) === manageGuild || (permissions & administrator) === administrator;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const premiumActiveEvents = new Set([
  EventName.SubscriptionCreated,
  EventName.SubscriptionUpdated,
  EventName.TransactionCompleted,
]);

const premiumInactiveEvents = new Set([
  EventName.SubscriptionCanceled,
  EventName.SubscriptionPaused,
  EventName.SubscriptionPastDue,
]);
