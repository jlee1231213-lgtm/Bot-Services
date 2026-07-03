import express from "express";
import { Environment, EventName, LogLevel, Paddle } from "@paddle/paddle-node-sdk";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createBotRequest,
  createSession,
  deleteSession,
  getBotRequests,
  getGuildSettings,
  getSession,
  isPremiumGuild,
  removePremiumGuild,
  setGuildSettings,
  setPremiumGuild,
} from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createServer() {
  const app = express();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  const port = process.env.PORT ?? 3000;
  const siteUrl = process.env.PUBLIC_SITE_URL ?? `http://localhost:${port}`;
  const backendUrl = process.env.PUBLIC_BACKEND_URL ?? `http://localhost:${port}`;

  app.use((request, response, next) => {
    const requestOrigin = request.get("origin");

    let origin = getSafeSiteOrigin(requestOrigin);

    // Allow requests with no origin (mobile apps, file://, console, etc.)
    if (!requestOrigin || requestOrigin === "null") {
      origin = siteUrl;
    }

    // Fallback safety
    if (!origin) {
      origin = siteUrl;
    }

    response.header("Access-Control-Allow-Origin", origin);
    response.header("Access-Control-Allow-Credentials", "true");
    response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
    if (request.method === "OPTIONS") {
      response.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.static(path.join(__dirname, "..")));

  // ===== ADMIN LOGIN PAGE UI =====
  app.get("/admin/login", (request, response) => {
    response.type("html").send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Login</title>
        <style>
          body { font-family: Arial; background:#0f0f14; color:white; display:flex; align-items:center; justify-content:center; height:100vh; }
          .box { background:#1a1a22; padding:25px; border-radius:12px; width:320px; }
          input { width:100%; padding:10px; margin-top:10px; border-radius:8px; border:none; }
          button { width:100%; padding:10px; margin-top:15px; border-radius:8px; border:none; background:#5865f2; color:white; cursor:pointer; }
          button:hover { background:#4752c4; }
          .msg { margin-top:10px; font-size:14px; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>Admin Login</h2>
          <input id="key" placeholder="Enter Admin Key" type="password" />
          <button onclick="login()">Login</button>
          <div class="msg" id="msg"></div>
        </div>

        <script>
          async function login() {
            const adminKey = document.getElementById('key').value;

            const res = await fetch('/api/admin/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ adminKey })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
              document.getElementById('msg').innerText = "Login successful! Redirecting...";
              setTimeout(() => {
                window.location.href = "/owner";
              }, 800);
            } else {
              document.getElementById('msg').innerText = data.error || "Login failed";
            }
          }
        </script>
      </body>
      </html>
    `);
  });

  app.post("/api/admin/login", express.json(), (req, res) => {
    const adminKey = process.env.ADMIN_KEY;
    const provided = req.body?.adminKey;

    if (!adminKey || provided !== adminKey) {
      return res.status(403).json({ error: "Invalid admin key" });
    }

    const session = createSignedSession({
      admin: true,
      ts: Date.now()
    });

    res.cookie("admin_session", session, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ ok: true });
  });

  // ===== OWNER PANEL UI =====
  app.get("/owner", (request, response) => {
    if (!isOwnerRequest(request)) {
      response.status(403).send(`
        <h2>Owner Panel Locked</h2>
        <p>You must log in via <code>/api/admin/login</code></p>
      `);
      return;
    }

    response.type("html").send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Owner Dashboard</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #0f0f14;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }

          .topbar {
            background: #1a1a22;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .badge {
            background: #5865f2;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 12px;
          }

          .container {
            max-width: 900px;
            margin: 20px auto;
            padding: 20px;
          }

          .card {
            background: #1a1a22;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 15px;
          }

          input, button {
            width: 100%;
            padding: 12px;
            margin-top: 10px;
            border-radius: 8px;
            border: none;
            font-size: 14px;
          }

          button {
            background: #5865f2;
            color: white;
            cursor: pointer;
          }

          button:hover {
            background: #4752c4;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }

          pre {
            background: #111;
            padding: 10px;
            border-radius: 8px;
            overflow: auto;
          }

          .muted {
            opacity: 0.7;
            font-size: 13px;
          }
        </style>
      </head>

      <body>
        <div class="topbar">
          <div><b>Owner Dashboard</b></div>
          <div class="badge">LIVE</div>
        </div>

        <div class="container">

          <div class="card">
            <h3>Session Info</h3>
            <button onclick="loadMe()">Load My Session</button>
            <pre id="me">Click above to load session info</pre>
          </div>

          <div class="card">
            <h3>Support Lookup</h3>
            <p class="muted">Search users by support code (LS-...)</p>

            <input id="code" placeholder="Enter Support Code" />
            <button onclick="search()">Search</button>

            <pre id="result"></pre>
          </div>

        </div>

        <script>
          async function loadMe() {
            const res = await fetch('/api/me', { credentials: 'include' });
            const data = await res.json();
            document.getElementById('me').innerText = JSON.stringify(data, null, 2);
          }

          async function search() {
            const supportCode = document.getElementById('code').value;

            const res = await fetch('/api/owner/support-access', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({ supportCode })
            });

            const data = await res.json();
            document.getElementById('result').innerText = JSON.stringify(data, null, 2);
          }
        </script>

      </body>
      </html>
    `);
  });

  app.get("/health", (_request, response) => {
    response.json({ ok: true, service: "logic-systems-bot" });
  });

  app.get("/debug/config", (_request, response) => {
    const clientSecret = cleanEnvValue(process.env.DISCORD_CLIENT_SECRET);
    response.json({
      signedSessions: true,
      hasSessionSecret: Boolean(process.env.SESSION_SECRET),
      discordClientId: cleanEnvValue(process.env.DISCORD_CLIENT_ID) || null,
      hasDiscordClientSecret: Boolean(clientSecret),
      discordClientSecretLength: clientSecret.length,
      discordClientSecretFingerprint: clientSecret ? crypto.createHash("sha256").update(clientSecret).digest("hex").slice(0, 10) : null,
      publicSiteUrl: siteUrl,
      publicBackendUrl: process.env.PUBLIC_BACKEND_URL ?? null,
    });
  });

  app.get("/auth/discord", (request, response) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      response.status(500).send("DISCORD_CLIENT_ID is not configured.");
      return;
    }

    const requestBackendUrl = getRequestBackendUrl(request, backendUrl);
    const returnTo = getSafeSiteUrl(request.query.returnTo);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${requestBackendUrl}/auth/discord/callback`,
      response_type: "code",
      scope: "identify guilds",
      prompt: "none",
    });
    if (returnTo) params.set("state", createOAuthState(returnTo));

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
      const returnTo = parseOAuthState(request.query.state) ?? "dashboard";
      response.redirect(`${siteUrl}/#${returnTo}?session=${encodeURIComponent(sessionId)}`);
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

  if (!session) {
    return response.status(401).json({ error: "Not authenticated" });
  }

  const supportCode = `LS-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

  response.json({
    user: session.user,
    supportCode
  });
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

    const settings = await getGuildSettings(request.params.guildId);
    response.json({
      premium: await isPremiumGuild(request.params.guildId),
      settings: mergeSettings(settings, request.params.guildId),
    });
  });

  app.put("/api/guilds/:guildId/settings", express.json(), async (request, response) => {
    const session = await requireSession(request, response);
    if (!session) return;
    if (!session.guilds.some((guild) => guild.id === request.params.guildId)) {
      response.status(403).json({ error: "You cannot manage this server." });
      return;
    }
    const settings = sanitizeSettings(request.body);
    await setGuildSettings(request.params.guildId, settings);
    response.json({ ok: true, settings: mergeSettings(settings, request.params.guildId) });
  });

  app.post("/api/owner/support-access", express.json(), async (request, response) => {
    if (!isOwnerRequest(request, request.body?.adminKey)) {
      response.status(403).json({ error: "Owner access required." });
      return;
    }

    const supportCode = cleanSupportCode(request.body?.supportCode);
    const guildId = cleanText(request.body?.guildId, "", 40);
    const targetGuildId = guildId || decodeSupportCode(supportCode);
    if (!targetGuildId || supportCodeForGuild(targetGuildId) !== supportCode) {
      response.status(404).json({ error: "No server found for that support code." });
      return;
    }

    response.json({
      guildId: targetGuildId,
      premium: await isPremiumGuild(targetGuildId),
      settings: mergeSettings(await getGuildSettings(targetGuildId), targetGuildId),
    });
  });

  app.put("/api/owner/guilds/:guildId/settings", express.json(), async (request, response) => {
    if (!isOwnerRequest(request, request.body?.adminKey)) {
      response.status(403).json({ error: "Owner access required." });
      return;
    }

    const supportCode = cleanSupportCode(request.body?.supportCode);
    if (supportCodeForGuild(request.params.guildId) !== supportCode) {
      response.status(403).json({ error: "Support code does not match this server." });
      return;
    }

    const settings = sanitizeSettings(request.body);
    await setGuildSettings(request.params.guildId, settings);
    response.json({ ok: true, settings: mergeSettings(settings, request.params.guildId) });
  });

  app.post("/api/bot-requests", express.json(), async (request, response) => {
    const botRequest = await createBotRequest(sanitizeBotRequest(request.body));
    response.status(201).json({ ok: true, request: botRequest });
  });

  app.get("/api/bot-requests", async (request, response) => {
    if (!isOwnerRequest(request)) {
      response.status(403).json({ error: "Admin access required." });
      return;
    }
    response.json({ requests: await getBotRequests() });
  });

  app.post("/api/premium/manual", express.json(), async (request, response) => {
    if (!isOwnerRequest(request, request.body?.adminKey)) {
      response.status(403).json({ error: "Owner access required." });
      return;
    }
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
  embedMessage: "A session startup has been posted. Join quickly, listen to staff, and keep the roleplay realistic.",
  embedColor: "#5865f2",
  footerText: "Logic Systems Custom",
  customEmbeds: true,
  commandTemplates: {
    startup: {
      title: "Session Startup",
      message: "A session startup has been posted. Join quickly, listen to staff, and keep the roleplay realistic.",
      color: "#5865f2",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "10",
      enabled: true,
    },
    release: {
      title: "Session Release",
      message: "The roleplay session has been released. Check the details below and join when ready.",
      color: "#23c46e",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    reinvites: {
      title: "Reinvites Open",
      message: "Reinvites are open for this session. Use the details below to return to roleplay.",
      color: "#64d8ff",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "5",
      enabled: true,
    },
    ea: {
      title: "Early Access",
      message: "Early access is now open. Staff may use this post for limited session entry.",
      color: "#f2c94c",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    over: {
      title: "Session Over",
      message: "The roleplay session is now over. Thank you for joining.",
      color: "#ff6b6b",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    peacetime: {
      title: "Peacetime Status",
      message: "Peacetime status has been updated for the server.",
      color: "#9b8cff",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    priority: {
      title: "Priority Status",
      message: "Priority status has been updated. Follow staff directions before starting scenes.",
      color: "#ff9f43",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    scene: {
      title: "Scene Update",
      message: "A new scene update has been posted. Use the details below for location and instructions.",
      color: "#76f0d2",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    staff: {
      title: "Staff Announcement",
      message: "Staff have posted a new announcement for the server.",
      color: "#5865f2",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    ticket: {
      title: "Support Ticket",
      message: "A support ticket panel is ready. Use this for staff help and service requests.",
      color: "#64d8ff",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    ssu: {
      title: "Server Startup",
      message: "Server startup is now active. Join up and prepare for roleplay.",
      color: "#5865f2",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "10",
      enabled: true,
    },
    modcall: {
      title: "Moderator Call",
      message: "Moderators are needed for the current roleplay session.",
      color: "#ff6b6b",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    lowmod: {
      title: "Low Moderation",
      message: "Moderator coverage is low. Available staff should assist the session when possible.",
      color: "#ff9f43",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    fullmod: {
      title: "Full Moderation",
      message: "Moderator coverage is full. Staff coverage is active for the current session.",
      color: "#23c46e",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    ssd: {
      title: "Server Shutdown",
      message: "Server shutdown has been announced. Wrap up scenes and follow staff instructions.",
      color: "#ff6b6b",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    cohost: {
      title: "Cohost Added",
      message: "A cohost has been added to the session.",
      color: "#76f0d2",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    cohostEnd: {
      title: "Cohost Ended",
      message: "The cohost session has ended.",
      color: "#aeb6cc",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    rules: {
      title: "Roleplay Rules",
      message: "Follow all roleplay rules, listen to staff, and keep scenes realistic.",
      color: "#5865f2",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    joinVc: {
      title: "Join Voice Chat",
      message: "Please join the required voice channel for this session.",
      color: "#64d8ff",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    hatepings: {
      title: "Ping Reminder",
      message: "Do not spam ping staff. Open a ticket or wait for staff to respond.",
      color: "#ff6b6b",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    quota: {
      title: "Staff Quota Update",
      message: "Staff quota progress has been updated.",
      color: "#9b8cff",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    supervise: {
      title: "Supervision Notice",
      message: "A staff supervision notice has been posted.",
      color: "#f2c94c",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    warn: {
      title: "Warning Issued",
      message: "A staff warning has been issued.",
      color: "#ffd166",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    mute: {
      title: "Member Muted",
      message: "A member has been timed out by staff.",
      color: "#ff9f43",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    unmute: {
      title: "Member Unmuted",
      message: "A member timeout has been removed.",
      color: "#23c46e",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    kick: {
      title: "Member Kicked",
      message: "A member has been kicked by staff.",
      color: "#ff6b6b",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    ban: {
      title: "Member Banned",
      message: "A member has been banned by staff.",
      color: "#ff6b6b",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    register: {
      title: "Registration Added",
      message: "A roleplay registration has been added.",
      color: "#76f0d2",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    unregister: {
      title: "Registration Removed",
      message: "A roleplay registration has been removed.",
      color: "#aeb6cc",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    warrant: {
      title: "Warrant Posted",
      message: "A roleplay warrant has been posted.",
      color: "#ff6b6b",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    payticket: {
      title: "Ticket Paid",
      message: "A roleplay ticket payment has been recorded.",
      color: "#23c46e",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    profile: {
      title: "Roleplay Profile",
      message: "A roleplay profile card has been created.",
      color: "#64d8ff",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    staffProfile: {
      title: "Staff Profile",
      message: "A staff profile card has been created.",
      color: "#9b8cff",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    balance: {
      title: "Wallet Balance",
      message: "A roleplay wallet balance has been posted.",
      color: "#23c46e",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    work: {
      title: "Work Shift Receipt",
      message: "A roleplay work shift receipt has been posted.",
      color: "#f2c94c",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    deposit: {
      title: "Deposit Receipt",
      message: "A roleplay deposit receipt has been posted.",
      color: "#23c46e",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    withdraw: {
      title: "Withdrawal Receipt",
      message: "A roleplay withdrawal receipt has been posted.",
      color: "#ff9f43",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
    giveMoney: {
      title: "Money Transfer",
      message: "A roleplay money transfer has been posted.",
      color: "#76f0d2",
      footer: "Powered by Logic Systems",
      pingRole: "",
      channel: "",
      cooldown: "0",
      enabled: true,
    },
  },
};

const staleTemplateMessages = {
  startup: ["A new roleplay session is starting. Join up, follow staff directions, and keep scenes realistic."],
};

function sanitizeSettings(body) {
  return {
    embedTitle: cleanText(body.embedTitle, "Session Startup", 120),
    embedMessage: cleanText(body.embedMessage, "A new roleplay session is starting.", 1000),
    embedColor: /^#[0-9a-f]{6}$/i.test(body.embedColor) ? body.embedColor : "#5865f2",
    footerText: cleanText(body.footerText, "Logic Systems Custom", 120),
    customEmbeds: Boolean(body.customEmbeds),
    commandTemplates: sanitizeCommandTemplates(body.commandTemplates),
  };
}

function sanitizeBotRequest(body = {}) {
  return {
    serverName: cleanText(body.serverName, "Unnamed RP Server", 120),
    discordTag: cleanText(body.discordTag, "Not provided", 80),
    invite: cleanText(body.invite, "", 160),
    botName: cleanText(body.botName, "Logic Custom", 80),
    style: cleanText(body.style, "Clean roleplay system", 120),
    commands: cleanText(body.commands, "startup, release, reinvites, staff, tickets", 500),
    notes: cleanText(body.notes, "No extra notes.", 1000),
  };
}

function isOwnerRequest(request) {
  const adminSession = getCookie(request, "admin_session");

  if (adminSession) {
    const session = verifySignedSession(adminSession);
    if (session?.admin === true) return true;
  }

  const adminKey = process.env.ADMIN_KEY;
  return Boolean(adminKey && request.get("x-admin-key") === adminKey);
}

function mergeSettings(settings = {}, guildId = "") {
  return {
    ...defaultSettings,
    ...(settings ?? {}),
    supportCode: supportCodeForGuild(guildId),
    commandTemplates: sanitizeCommandTemplates(settings?.commandTemplates),
  };
}

function cleanSupportCode(value) {
  return String(value ?? "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
}

function supportCodeForGuild(guildId) {
  const normalized = String(guildId ?? "").trim();
  if (!normalized) return "";
  return `LS-${normalized}`;
}

function decodeSupportCode(supportCode) {
  if (!supportCode?.startsWith("LS-")) return "";
  const decoded = supportCode.slice(3);
  return /^\d{10,30}$/.test(decoded) ? decoded : "";
}

function sanitizeCommandTemplates(templates = {}) {
  return Object.fromEntries(
    Object.entries(defaultSettings.commandTemplates).map(([name, defaults]) => {
      const template = templates?.[name] ?? {};
      const message = staleTemplateMessages[name]?.includes(template.message) ? defaults.message : template.message;
      return [
        name,
        {
          title: cleanText(template.title, defaults.title, 120),
          message: cleanText(message, defaults.message, 1000),
          color: /^#[0-9a-f]{6}$/i.test(template.color) ? template.color : defaults.color,
          footer: cleanText(template.footer, defaults.footer, 120),
          pingRole: cleanText(template.pingRole, "", 80),
          channel: cleanText(template.channel, "", 80),
          cooldown: cleanText(template.cooldown, defaults.cooldown, 8),
          enabled: template.enabled !== false,
        },
      ];
    }),
  );
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

function getSafeSiteOrigin(value) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    const isLocalhost = ["localhost", "127.0.0.1"].includes(url.hostname);
    if (url.protocol !== "https:" && !(isLocalhost && url.protocol === "http:")) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function getSafeSiteUrl(value) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    const safeOrigin = getSafeSiteOrigin(url.origin);
    if (!safeOrigin) return null;
    return `${safeOrigin}${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

function createOAuthState(returnTo) {
  return Buffer.from(JSON.stringify({ returnTo }), "utf8").toString("base64url");
}

function parseOAuthState(state) {
  if (typeof state !== "string" || !state) return null;
  try {
    const payload = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    return getSafeSiteUrl(payload.returnTo);
  } catch {
    return null;
  }
}

async function exchangeDiscordCode(code, backendUrl) {
  const clientId = cleanEnvValue(process.env.DISCORD_CLIENT_ID);
  const clientSecret = cleanEnvValue(process.env.DISCORD_CLIENT_SECRET);

  if (!clientSecret) {
    throw new Error("DISCORD_CLIENT_SECRET is not configured.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
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
    if (response.status === 401 && errorBody.includes("invalid_client")) {
      throw new Error(
        "Discord rejected the OAuth client credentials. Check that DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET on your backend host match the same Discord Developer Portal application, then redeploy/restart the backend.",
      );
    }
    throw new Error(`Discord token exchange failed: ${response.status} ${errorBody}`);
  }
  return response.json();
}

function cleanEnvValue(value) {
  return String(value ?? "").trim().replace(/^["']|["']$/g, "");
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
