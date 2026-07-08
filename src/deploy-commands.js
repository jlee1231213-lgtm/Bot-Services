import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commands } from "./commands.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = cleanSnowflake(process.env.DISCORD_GUILD_ID);

if (!token || !clientId) {
  throw new Error("DISCORD_TOKEN and DISCORD_CLIENT_ID are required.");
}

const rest = new REST({ version: "10" }).setToken(token);

if (guildId) {
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
  console.log(`Registered commands for guild ${guildId}.`);
} else {
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log("Registered global commands.");
}

function cleanSnowflake(value) {
  const trimmed = String(value ?? "").trim();
  return /^\d{17,20}$/.test(trimmed) ? trimmed : "";
}
