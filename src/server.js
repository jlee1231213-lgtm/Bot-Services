import express from "express";
import { Environment, EventName, LogLevel, Paddle } from "@paddle/paddle-node-sdk";
import { removePremiumGuild, setPremiumGuild } from "./store.js";

export function createServer() {
  const app = express();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  app.get("/health", (_request, response) => {
    response.json({ ok: true, service: "logic-systems-bot" });
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
