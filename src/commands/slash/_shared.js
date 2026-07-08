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
  const embedFooterIcon = useTemplate ? template.footerIcon : settings?.footerIcon;
  const embedColor = useTemplate ? template.color : settings?.embedColor;
  const embedImage = useTemplate ? template.image : settings?.embedImage;
  const embedThumbnail = useTemplate ? template.thumbnail : settings?.embedThumbnail;

  const embed = new EmbedBuilder()
    .setColor(parseHexColor(embedColor) ?? brandColor)
    .setTitle(embedTitle ?? title)
    .setDescription(embedDescription)
    .setTimestamp();

  embed.setFooter({
    text: embedFooter ?? "Powered by Logic Systems",
    iconURL: cleanUrl(embedFooterIcon) || undefined,
  });

  const imageUrl = cleanUrl(embedImage);
  const thumbnailUrl = cleanUrl(embedThumbnail);
  if (imageUrl) embed.setImage(imageUrl);
  if (thumbnailUrl) embed.setThumbnail(thumbnailUrl);

  return embed;
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
  "Cohost Ended": "cohost-end",
  "Roleplay Rules": "rules",
  "Join Voice Chat": "join-vc",
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
  "Staff Profile": "staff-profile",
  "Wallet Balance": "balance",
  "Work Shift Receipt": "work",
  "Deposit Receipt": "deposit",
  "Withdrawal Receipt": "withdraw",
  "Money Transfer": "give-money",
  "Member Count": "membercount",
  "Startup Cooldown Reset": "reset-startup-cooldown",
  "Over Cooldown Reset": "reset-over-cooldown",
};

export function parseHexColor(value) {
  if (!value) return null;
  const normalized = value.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;
  return Number.parseInt(normalized, 16);
}

function cleanUrl(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  try {
    const url = new URL(text);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}
