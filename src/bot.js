import { Client, EmbedBuilder, GatewayIntentBits } from "discord.js";
import { isPremiumGuild } from "./store.js";

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
      startup: () => standardEmbed("Session Startup", "A new roleplay session is starting. Join up and follow the server rules."),
      ea: () => standardEmbed("Early Access", "Early access is now open for approved members."),
      setup: () => standardEmbed("Setup", "Use Logic Systems commands for startup, EA, release, reinvites, and session over messages."),
      release: () => standardEmbed("Release", "The roleplay session has been released. Have fun and follow the rules."),
      reinvites: () => standardEmbed("Reinvites", "Reinvites are open. Use the server instructions to rejoin."),
      over: () => standardEmbed("Session Over", "The roleplay session is now over. Thanks for joining."),
    };

    if (handlers[interaction.commandName]) {
      await interaction.reply({ embeds: [handlers[interaction.commandName]()] });
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
    }
  });

  return client;
}

function standardEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(brandColor)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: "Powered by Logic Systems" });
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
