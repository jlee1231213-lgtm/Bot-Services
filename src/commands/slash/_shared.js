import { EmbedBuilder } from "discord.js";
import { getGuildSettings } from "../../store.js";

export const brandColor = 0x5865f2;

export function buildMessage(base, rows) {
  const details = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `**${label}**\n${value}`);
  return details.length ? `${base}\n\n${details.join("\n\n")}` : base;
}

export function cleanPing(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 120) return null;
  return trimmed;
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
    .setFooter({ text: embedFooter ?? "Powered by Logic Systems" })
    .setTimestamp();
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
  "Server Startup": "ssu",
  "Moderator Call": "modcall",
  "Low Moderation": "lowmod",
  "Full Moderation": "fullmod",
  "Server Shutdown": "ssd",
  "Session Release": "release",
  "Reinvites Open": "reinvites",
  "Early Access": "ea",
  "Session Over": "over",
  "Peacetime Enabled": "peacetime",
  "Peacetime Disabled": "peacetime",
  "Peacetime Status": "peacetime",
  "Priority Available": "priority",
  "Priority Cooldown": "priority",
  "Priority On Hold": "priority",
  "Scene Update": "scene",
  "Staff Announcement": "staff",
  "Support Ticket": "ticket",
  "Cohost Added": "cohost",
  "Cohost Ended": "cohostEnd",
  "Roleplay Rules": "rules",
  "Join Voice Chat": "joinVc",
  "Ping Reminder": "hatepings",
  "Staff Quota Update": "quota",
  "Supervision Notice": "supervise",
  "Warning Issued": "warn",
  "Member Muted": "mute",
  "Member Unmuted": "unmute",
  "Member Kicked": "kick",
  "Member Banned": "ban",
  "Registration Added": "register",
  "Registration Removed": "unregister",
  "Warrant Posted": "warrant",
  "Ticket Paid": "payticket",
  "Roleplay Profile": "profile",
  "Staff Profile": "staffProfile",
  "Wallet Balance": "balance",
  "Work Shift Receipt": "work",
  "Deposit Receipt": "deposit",
  "Withdrawal Receipt": "withdraw",
  "Money Transfer": "giveMoney",
  "Member Count": "membercount",
  "Startup Cooldown Reset": "resetStartupCooldown",
  "Over Cooldown Reset": "resetOverCooldown",
};

export function parseHexColor(value) {
  if (!value) return null;
  const normalized = value.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;
  return Number.parseInt(normalized, 16);
}
