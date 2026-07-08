import { ChannelType, Client, GatewayIntentBits, MessageFlags, PermissionFlagsBits } from "discord.js";
import { slashCommandMap } from "./commands/slash/index.js";

const ticketButtonId = "logic_systems_open_ticket";
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
    content: `${interaction.user} welcome to your Logic Systems support ticket.\n\nPlease send your server name, bot name, what you need help with, and screenshots/errors if something is broken. Never send your Discord password or bot token.`,
  });

  await interaction.reply({ content: `Ticket opened: ${channel}`, flags: MessageFlags.Ephemeral });
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
