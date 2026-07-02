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
  const template = getCommandTemplate(settings, title);
  const useTemplate = settings?.customEmbeds && template?.enabled !== false;
  const embedTitle = useTemplate ? template.title : settings?.customEmbeds ? settings.embedTitle : title;
  const embedDescription = buildTemplateDescription(useTemplate ? template.message : settings?.customEmbeds ? settings.embedMessage : description, description);
  const embedFooter = useTemplate ? template.footer : settings?.footerText;
  const embedColor = useTemplate ? template.color : settings?.embedColor;

  return new EmbedBuilder()
    .setColor(parseHexColor(embedColor) ?? brandColor)
    .setTitle(embedTitle ?? title)
    .setDescription(embedDescription)
    .setFooter({ text: embedFooter ?? "Powered by Logic Systems" });
}

function getCommandTemplate(settings, title) {
  const key = commandTemplateKeys[title] ?? commandTemplateKeys[title?.replace(/^Scene:.+$/i, "Scene Update")];
  return key ? settings?.commandTemplates?.[key] : null;
}

function buildTemplateDescription(templateMessage, commandDetails) {
  if (!templateMessage) return commandDetails;
  if (!commandDetails || commandDetails === templateMessage) return templateMessage;
  return `${templateMessage}\n\n${commandDetails}`;
}

const commandTemplateKeys = {
  "Session Startup": "startup",
  "Server Startup": "startup",
  "Session Release": "release",
  "Reinvites Open": "reinvites",
  "Early Access": "ea",
  "Session Over": "over",
  "Peacetime Enabled": "peacetime",
  "Peacetime Disabled": "peacetime",
  "Priority Available": "priority",
  "Priority Cooldown": "priority",
  "Priority On Hold": "priority",
  "Scene Update": "scene",
  "Staff Announcement": "staff",
  "Support Ticket": "ticket",
};

export function parseHexColor(value) {
  if (!value) return null;
  const normalized = value.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;
  return Number.parseInt(normalized, 16);
}
