import { Client, EmbedBuilder, GatewayIntentBits } from "discord.js";
import { getGuildSettings, isPremiumGuild } from "./store.js";

const brandColor = 0x3c43ec;

export function createBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once("ready", () => {
    console.log(`Logic Systems bot online as ${client.user.tag}.`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const handlers = {
      startup: () => standardEmbed(interaction.guildId, "Session Startup", "A new roleplay session is starting. Join up and follow the server rules."),
      ea: () => standardEmbed(interaction.guildId, "Early Access", "Early access is now open for approved members."),
      setup: () => standardEmbed(interaction.guildId, "Setup", "Use Logic Systems commands for startup, EA, release, reinvites, and session over messages."),
      release: () => standardEmbed(interaction.guildId, "Release", "The roleplay session has been released. Have fun and follow the rules."),
      reinvites: () => standardEmbed(interaction.guildId, "Reinvites", "Reinvites are open. Use the server instructions to rejoin."),
      over: () => standardEmbed(interaction.guildId, "Session Over", "The roleplay session is now over. Thanks for joining."),
      rules: () => standardEmbed(interaction.guildId, "Roleplay Rules", "Follow staff instructions, stay in character, avoid fail roleplay, and keep the session fair for everyone."),
      ssu: () => standardEmbed(interaction.guildId, "Server Startup", interaction.options.getString("notes") ?? "Server startup is now active. Join up and prepare for roleplay."),
    };

    if (handlers[interaction.commandName]) {
      await interaction.reply({ embeds: [await handlers[interaction.commandName]()] });
      return;
    }

    if (interaction.commandName === "help") {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(brandColor)
            .setTitle("Logic Systems Commands")
            .setDescription("Free: `/startup`, `/ea`, `/setup`, `/release`, `/reinvites`, `/over`, `/rules`, `/peacetime`, `/ssu`, `/vote`, `/status`\nPremium: `/embed`, `/announce`, `/antiraid`, dashboard embed customization.")
            .setFooter({ text: "Logic Systems" }),
        ],
        ephemeral: true,
      });
      return;
    }

    if (interaction.commandName === "status") {
      const hasPremium = await isPremiumGuild(interaction.guildId);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(hasPremium ? 0x76f0d2 : brandColor)
            .setTitle("Logic Systems Status")
            .setDescription(`Bot is online.\nPlan: ${hasPremium ? "Premium" : "Free"}`)
            .setFooter({ text: hasPremium ? "Logic Systems Premium" : "Powered by Logic Systems" }),
        ],
        ephemeral: true,
      });
      return;
    }

    if (interaction.commandName === "peacetime") {
      const status = interaction.options.getString("status", true);
      await interaction.reply({
        embeds: [
          await standardEmbed(
            interaction.guildId,
            `Peacetime ${status === "on" ? "Enabled" : "Disabled"}`,
            status === "on"
              ? "Peacetime is now active. No priority scenes, pursuits, or violent roleplay unless staff approves."
              : "Peacetime is now disabled. Normal roleplay may resume.",
          ),
        ],
      });
      return;
    }

    if (interaction.commandName === "vote") {
      const question = interaction.options.getString("question") ?? "Start a roleplay session?";
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(brandColor)
            .setTitle("Session Vote")
            .setDescription(question)
            .setFooter({ text: "Use this as a session vote prompt" }),
        ],
      });
      return;
    }

    if (interaction.commandName === "embed") {
      if (!(await ensurePremium(interaction))) return;

      const title = interaction.options.getString("title", true);
      const message = interaction.options.getString("message", true);
      const color = parseHexColor(interaction.options.getString("color")) ?? brandColor;

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(message)
            .setFooter({ text: "Logic Systems Premium" }),
        ],
      });
      return;
    }

    if (interaction.commandName === "announce") {
      if (!(await ensurePremium(interaction))) return;

      const settings = await getGuildSettings(interaction.guildId);
      const title = interaction.options.getString("title", true);
      const message = interaction.options.getString("message", true);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(parseHexColor(settings?.embedColor) ?? brandColor)
            .setTitle(title)
            .setDescription(message)
            .setFooter({ text: settings?.footerText ?? "Logic Systems Premium" }),
        ],
      });
      return;
    }

    if (interaction.commandName === "antiraid") {
      if (!(await ensurePremium(interaction))) return;

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x76f0d2)
            .setTitle("Anti-Raid Protection")
            .setDescription("Premium anti-raid protection is enabled for this server.")
            .setFooter({ text: "Logic Systems Premium" }),
        ],
        ephemeral: true,
      });
      return;
    }
  });

  return client;
}

async function standardEmbed(guildId, title, description) {
  const hasPremium = await isPremiumGuild(guildId);
  const settings = hasPremium ? await getGuildSettings(guildId) : null;

  return new EmbedBuilder()
    .setColor(parseHexColor(settings?.embedColor) ?? brandColor)
    .setTitle(settings?.customEmbeds ? settings.embedTitle : title)
    .setDescription(settings?.customEmbeds ? settings.embedMessage : description)
    .setFooter({ text: hasPremium ? (settings?.footerText ?? "Logic Systems Premium") : "Powered by Logic Systems" });
}

async function ensurePremium(interaction) {
  const hasPremium = await isPremiumGuild(interaction.guildId);
  if (hasPremium) return true;

  await interaction.reply({
    content: "This command requires Logic Premium. Use the Premium button on the Logic Systems website to upgrade.",
    ephemeral: true,
  });
  return false;
}

function parseHexColor(value) {
  if (!value) return null;
  const normalized = value.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;
  return Number.parseInt(normalized, 16);
}
