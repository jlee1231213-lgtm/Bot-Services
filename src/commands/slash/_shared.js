import { EmbedBuilder } from "discord.js";
import { getGuildSettings } from "../../store.js";

export const brandColor = 0x5865f2;

export function buildMessage(base, rows) {
  const details = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `**${label}:** ${value}`);
  return details.length ? `${base}\n\n${details.join("\n")}` : base;
}

export async function standardEmbed(guildId, title, description) {
  const settings = await getGuildSettings(guildId);

  return new EmbedBuilder()
    .setColor(parseHexColor(settings?.embedColor) ?? brandColor)
    .setTitle(settings?.customEmbeds ? settings.embedTitle : title)
    .setDescription(settings?.customEmbeds ? settings.embedMessage : description)
    .setFooter({ text: settings?.footerText ?? "Powered by Logic Systems" });
}

export function parseHexColor(value) {
  if (!value) return null;
  const normalized = value.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;
  return Number.parseInt(normalized, 16);
}
