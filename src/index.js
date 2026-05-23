import "dotenv/config";
import { createBot } from "./bot.js";
import { createServer } from "./server.js";

const token = process.env.DISCORD_TOKEN;
const port = Number(process.env.PORT ?? 3000);

if (!token) {
  throw new Error("DISCORD_TOKEN is required. Copy .env.example to .env and add your bot token.");
}

const app = createServer();
app.listen(port, () => {
  console.log(`Logic Systems web server listening on port ${port}.`);
});

const bot = createBot();
await bot.login(token);
