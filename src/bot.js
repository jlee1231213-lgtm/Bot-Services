import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import { slashCommandMap } from "./commands/slash/index.js";

const ticketButtonId = "logic_systems_open_ticket";
const closeTicketButtonId = "logic_systems_close_ticket";
const brandColor = 0x5865f2;
const staffRoleNames = ["Logic Owner", "Logic Director", "Build Lead", "Senior Support", "Support Specialist", "Trial Support"];

export function createBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once("clientReady", () => {
    console.log(`Logic Systems bot online as ${client.user.tag}.`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton() && interaction.customId === ticketButtonId) {
      await handleTicketButton(interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId === closeTicketButtonId) {
      await handleCloseTicketButton(interaction);
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = slashCommandMap.get(interaction.commandName);
    if (!command) return;

    console.log(`Command received: /${interaction.commandName} in guild ${interaction.guildId}`);
    const startedAt = Date.now();

    try {
      await command.execute(interaction);
      console.log(`Command completed: /${interaction.commandName} in ${Date.now() - startedAt}ms`);
    } catch (error) {
      console.error(`Command failed: /${interaction.commandName}`, error);
      await sendCommandError(interaction);
    }
  });

  return client;
}

async function handleTicketButton(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({ content: "Tickets can only be opened inside the Logic Systems server.", flags: MessageFlags.Ephemeral });
    return;
  }

  const existing = interaction.guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && channel.topic?.includes(`Ticket owner: ${interaction.user.id}`),
  );
  if (existing) {
    await interaction.reply({ content: `You already have an open ticket: ${existing}`, flags: MessageFlags.Ephemeral });
    return;
  }

  const category = interaction.guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name.toLowerCase() === "support desk",
  );
  const staffRoles = staffRoleNames
    .map((name) => interaction.guild.roles.cache.find((role) => role.name === name))
    .filter(Boolean);
  const safeName = interaction.user.username.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 18) || "user";

  const channel = await interaction.guild.channels.create({
    name: `ticket-${safeName}`,
    type: ChannelType.GuildText,
    parent: category?.id,
    topic: `Logic Systems support ticket • Ticket owner: ${interaction.user.id}`,
    permissionOverwrites: [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
        ],
      },
      ...staffRoles.map((role) => ({
        id: role.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.ManageMessages,
        ],
      })),
    ],
    reason: `Logic Systems support ticket opened by ${interaction.user.tag}`,
  });

  await channel.send({
    content: `${interaction.user}`,
    embeds: [
      new EmbedBuilder()
        .setColor(brandColor)
        .setTitle("Logic Systems Support Ticket")
        .setDescription(
          "Tell us what you need help with and a support team member will reply here. Please include enough detail for us to reproduce the problem.",
        )
        .addFields(
          { name: "Include", value: "Your server name, bot name, command or dashboard page, and the result you expected." },
          { name: "If something broke", value: "Send the full error and a screenshot when possible." },
          { name: "Keep your account safe", value: "Never send your Discord password, bot token, or private login information." },
        )
        .setFooter({ text: "Powered by Logic Systems • Owned by Pnkstrz_._" })
        .setTimestamp(),
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(closeTicketButtonId)
          .setLabel("Close Ticket")
          .setStyle(ButtonStyle.Danger),
      ),
    ],
  });

  await interaction.reply({ content: `Ticket opened: ${channel}`, flags: MessageFlags.Ephemeral });
}

async function handleCloseTicketButton(interaction) {
  if (!interaction.inGuild() || interaction.channel?.type !== ChannelType.GuildText) {
    await interaction.reply({ content: "This button only works inside a support ticket.", flags: MessageFlags.Ephemeral });
    return;
  }

  const ownerId = interaction.channel.topic?.match(/Ticket owner: (\d+)/)?.[1];
  const canClose = ownerId === interaction.user.id || interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels);
  if (!ownerId || !canClose) {
    await interaction.reply({ content: "Only the ticket owner or support staff can close this ticket.", flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.reply({ content: "Ticket closed. This channel will be deleted in 5 seconds." });
  setTimeout(() => {
    interaction.channel.delete(`Logic Systems ticket closed by ${interaction.user.tag}`).catch((error) => {
      console.error("Could not delete closed ticket channel", error);
    });
  }, 5_000);
}

async function sendCommandError(interaction) {
  const payload = {
    content: "Something went wrong while running that command. Please try again.",
    flags: MessageFlags.Ephemeral,
  };

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(payload).catch(() => {});
    return;
  }

  await interaction.reply(payload).catch(() => {});
}
