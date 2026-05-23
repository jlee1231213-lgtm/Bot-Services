import "dotenv/config";
import { createBot } from "./bot.js";

const token = process.env.DISCORD_TOKEN;

if (!token) {
  throw new Error("DISCORD_TOKEN is required.");
}

const bot = createBot();
await bot.login(token);
