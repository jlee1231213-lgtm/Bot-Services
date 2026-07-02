import { Client, EmbedBuilder, GatewayIntentBits } from "discord.js";
import { getGuildSettings } from "./store.js";

const brandColor = 0x5865f2;

export function createBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once("ready", () => {
    console.log(`Logic Systems bot online as ${client.user.tag}.`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    console.log(`Command received: /${interaction.commandName} in guild ${interaction.guildId}`);

    try {
      const handlers = {
        startup: () => standardEmbed(interaction.guildId, "Session Startup", startupMessage(interaction)),
        ea: () => standardEmbed(interaction.guildId, "Early Access", earlyAccessMessage(interaction)),
        setup: () => standardEmbed(interaction.guildId, "Logic Systems Setup", "Use Logic Systems for startup, EA, release, reinvites, peacetime, priority, staff notices, and session over messages."),
        release: () => standardEmbed(interaction.guildId, "Session Release", releaseMessage(interaction)),
        reinvites: () => standardEmbed(interaction.guildId, "Reinvites Open", reinviteMessage(interaction)),
        over: () => standardEmbed(interaction.guildId, "Session Over", sessionOverMessage(interaction)),
        rules: () => standardEmbed(interaction.guildId, "Roleplay Rules", "Follow staff instructions, stay in character, avoid fail roleplay, and keep every scene fair for everyone."),
        ssu: () => standardEmbed(interaction.guildId, "Server Startup", startupMessage(interaction)),
      };

      if (handlers[interaction.commandName]) {
        await interaction.reply({ embeds: [await handlers[interaction.commandName]()] });
        return;
      }

      await handleCommand(interaction);
    } catch (error) {
      console.error(`Command failed: /${interaction.commandName}`, error);
      await sendCommandError(interaction);
    }
  });

  return client;
}

async function handleCommand(interaction) {
  if (interaction.commandName === "help") {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(brandColor)
            .setTitle("Logic Systems Service")
            .setDescription("Free commands: `/startup`, `/ea`, `/setup`, `/release`, `/reinvites`, `/over`, `/rules`, `/peacetime`, `/priority`, `/scene`, `/staff`, `/ssu`, `/vote`, `/status`, `/embed`, `/announce`, `/antiraid`\nDashboard: free embed customization and server setup.")
            .setFooter({ text: "Powering Roblox Roleplay" }),
        ],
        ephemeral: true,
      });
      return;
    }

    if (interaction.commandName === "status") {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x76f0d2)
            .setTitle("Logic Systems Status")
            .setDescription("Service is online.\nPackage: Free Custom Bot")
            .setFooter({ text: "Logic Systems Free" }),
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

    if (interaction.commandName === "priority") {
      const status = interaction.options.getString("status", true);
      const messages = {
        available: ["Priority Available", "Priority scenes are available. Keep scenes realistic and follow staff directions."],
        cooldown: ["Priority Cooldown", "Priority scenes are on cooldown. No new priority scenes until staff clears it."],
        hold: ["Priority Hold", "All priority scenes are on hold. Continue normal roleplay and avoid major incidents."],
      };
      const [title, description] = messages[status];
      await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, title, description)] });
      return;
    }

    if (interaction.commandName === "scene") {
      const location = interaction.options.getString("location", true);
      const details = interaction.options.getString("details") ?? "Staff has posted a scene update. Follow directions and keep roleplay clean.";
      await interaction.reply({
        embeds: [await standardEmbed(interaction.guildId, `Scene: ${location}`, details)],
      });
      return;
    }

    if (interaction.commandName === "staff") {
      const message = interaction.options.getString("message", true);
      await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Staff Announcement", message)] });
      return;
    }

    if (interaction.commandName === "embed") {
      const title = interaction.options.getString("title", true);
      const message = interaction.options.getString("message", true);
      const color = parseHexColor(interaction.options.getString("color")) ?? brandColor;

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(message)
            .setFooter({ text: "Logic Systems Free" }),
        ],
      });
      return;
    }

    if (interaction.commandName === "announce") {
      const settings = await getGuildSettings(interaction.guildId);
      const title = interaction.options.getString("title", true);
      const message = interaction.options.getString("message", true);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(parseHexColor(settings?.embedColor) ?? brandColor)
            .setTitle(title)
            .setDescription(message)
            .setFooter({ text: settings?.footerText ?? "Logic Systems Free" }),
        ],
      });
      return;
    }

    if (interaction.commandName === "antiraid") {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x76f0d2)
            .setTitle("Anti-Raid Protection")
            .setDescription("Free anti-raid status tools are enabled for this server.")
            .setFooter({ text: "Logic Systems Free" }),
        ],
        ephemeral: true,
      });
      return;
    }
}

function startupMessage(interaction) {
  return buildMessage("A new roleplay session is starting. Join up, follow staff directions, and keep scenes realistic.", [
    ["Server", interaction.options.getString("server_name")],
    ["Code", interaction.options.getString("server_code")],
    ["Ping", interaction.options.getString("ping")],
    ["Notes", interaction.options.getString("notes")],
  ]);
}

function earlyAccessMessage(interaction) {
  return buildMessage("Early access is now open for approved members. Prepare your characters and wait for staff direction.", [
    ["Ping", interaction.options.getString("ping")],
    ["Notes", interaction.options.getString("notes")],
  ]);
}

function releaseMessage(interaction) {
  return buildMessage("The roleplay session has been released. Have fun, stay realistic, and follow the rules.", [
    ["Server", interaction.options.getString("server_name")],
    ["Code", interaction.options.getString("server_code")],
    ["Notes", interaction.options.getString("notes")],
  ]);
}

function reinviteMessage(interaction) {
  const amount = interaction.options.getInteger("amount");
  return buildMessage("Reinvites are open. Use the server instructions to rejoin cleanly.", [
    ["Amount", amount ? `${amount} reinvite${amount === 1 ? "" : "s"}` : null],
    ["Notes", interaction.options.getString("notes")],
  ]);
}

function sessionOverMessage(interaction) {
  return buildMessage("The roleplay session is now over. Thanks for joining the session.", [
    ["Next Session", interaction.options.getString("next_session")],
    ["Notes", interaction.options.getString("notes")],
  ]);
}

function buildMessage(base, rows) {
  const details = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `**${label}:** ${value}`);
  return details.length ? `${base}\n\n${details.join("\n")}` : base;
}

async function standardEmbed(guildId, title, description) {
  const settings = await getGuildSettings(guildId);

  return new EmbedBuilder()
    .setColor(parseHexColor(settings?.embedColor) ?? brandColor)
    .setTitle(settings?.customEmbeds ? settings.embedTitle : title)
    .setDescription(settings?.customEmbeds ? settings.embedMessage : description)
    .setFooter({ text: settings?.footerText ?? "Powered by Logic Systems" });
}

async function sendCommandError(interaction) {
  const payload = {
    content: "Something went wrong while running that command. Please try again.",
    ephemeral: true,
  };

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(payload).catch(() => {});
    return;
  }

  await interaction.reply(payload).catch(() => {});
}

function parseHexColor(value) {
  if (!value) return null;
  const normalized = value.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;
  return Number.parseInt(normalized, 16);
}
