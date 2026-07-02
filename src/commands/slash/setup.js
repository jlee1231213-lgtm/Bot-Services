import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

const serviceRoles = [
  { name: "Logic Owner", color: 0x5865f2, hoist: true },
  { name: "Logic Administrator", color: 0x64d8ff, hoist: true },
  { name: "Logic Manager", color: 0x23c46e, hoist: true },
  { name: "Developer", color: 0xf2c94c, hoist: true },
  { name: "Support Team", color: 0x9b8cff, hoist: true },
  { name: "Trial Support", color: 0xaeb6cc, hoist: false },
  { name: "Customer", color: 0x76f0d2, hoist: false },
  { name: "Bot Owner", color: 0xff9f43, hoist: false },
  { name: "Pending Request", color: 0xffd166, hoist: false },
  { name: "Completed Request", color: 0x23c46e, hoist: false },
  { name: "Announcements Ping", color: 0x5865f2, hoist: false },
  { name: "Updates Ping", color: 0x64d8ff, hoist: false },
  { name: "Support Ping", color: 0xff6b6b, hoist: false },
  { name: "Partner", color: 0x9b8cff, hoist: false },
];

const serviceCategories = [
  {
    name: "Information",
    channels: [
      ["welcome", "Start here for Logic Systems info."],
      ["announcements", "Service updates and important notices."],
      ["rules", "Server rules and service expectations."],
      ["faq", "Common questions about free custom bots."],
      ["service-info", "What Logic Systems provides."],
      ["bot-showcase", "Finished bots, previews, and demos."],
    ],
  },
  {
    name: "Support",
    channels: [
      ["create-ticket", "Open support for setup, dashboard, and bot issues."],
      ["support-status", "Support availability and wait times."],
      ["bug-reports", "Report broken commands or website issues."],
      ["suggestions", "Suggest commands, dashboard options, or service ideas."],
    ],
  },
  {
    name: "Bot Requests",
    channels: [
      ["request-a-bot", "Request a free custom bot using the format posted here."],
      ["request-status", "Staff updates for pending custom bot requests."],
      ["finished-bots", "Completed custom bot deliveries."],
      ["reviews", "Customer vouches and service reviews."],
    ],
  },
  {
    name: "Community",
    channels: [
      ["general", "Community chat."],
      ["media", "Images, clips, and server previews."],
      ["vouches", "Public service feedback."],
      ["partnerships", "Partnership requests and ads approved by staff."],
    ],
  },
  {
    name: "Staff Area",
    staffOnly: true,
    channels: [
      ["staff-chat", "Private staff discussion."],
      ["request-queue", "New custom bot requests."],
      ["claimed-requests", "Requests currently being handled."],
      ["bot-progress", "Build notes and progress updates."],
      ["staff-logs", "Internal staff logs."],
      ["admin-notes", "Owner and admin notes."],
    ],
  },
];

export const data = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Set up a Logic Systems bot-service Discord server template.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName("template")
      .setDescription("Preview or create the bot-service server layout.")
      .setRequired(false)
      .addChoices(
        { name: "Preview layout", value: "preview" },
        { name: "Create server layout", value: "create" },
      ),
  );

export async function execute(interaction) {
  const template = interaction.options.getString("template") ?? "preview";

  if (template === "preview") {
    await interaction.reply({ embeds: [previewEmbed()], ephemeral: true });
    return;
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageRoles)) {
    await interaction.reply({
      content: "I need `Manage Channels` and `Manage Roles` before I can build the server template.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const roles = await ensureRoles(interaction.guild);
  const createdChannels = [];

  for (const categoryTemplate of serviceCategories) {
    const category = await ensureCategory(interaction.guild, categoryTemplate, roles);

    for (const [channelName, topic] of categoryTemplate.channels) {
      const channel = await ensureTextChannel(interaction.guild, category, channelName, topic, categoryTemplate.staffOnly, roles);
      createdChannels.push(channel);
    }
  }

  await ensureVoiceChannels(interaction.guild, roles);
  await postStarterMessages(interaction.guild);

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x23c46e)
        .setTitle("Logic Systems Server Template Created")
        .setDescription(
          `Created or verified **${serviceRoles.length} roles**, **${serviceCategories.length} categories**, **${createdChannels.length} text channels**, and starter request/support messages.\n\nNext: adjust channel permissions, add your logo/banner, and run \`/settings\` to customize bot embeds.`,
        )
        .setFooter({ text: "Powered by Logic Systems" }),
    ],
  });
}

function previewEmbed() {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Logic Systems Bot-Service Template")
    .setDescription(
      [
        "**Creates categories:** Information, Support, Bot Requests, Community, Staff Area",
        "**Creates roles:** Owner, Administrator, Manager, Developer, Support Team, Customer, Bot Owner, pings, and request statuses",
        "**Posts starter messages:** rules, request format, ticket panel copy, and service info",
        "",
        "Run `/setup template:create` to build it.",
      ].join("\n"),
    )
    .setFooter({ text: "Free custom bot service layout" });
}

async function ensureRoles(guild) {
  const roles = new Map();
  for (const roleTemplate of serviceRoles) {
    const existing = guild.roles.cache.find((role) => role.name === roleTemplate.name);
    const role =
      existing ??
      (await guild.roles.create({
        name: roleTemplate.name,
        color: roleTemplate.color,
        hoist: roleTemplate.hoist,
        mentionable: roleTemplate.name.includes("Ping"),
        reason: "Logic Systems server template setup",
      }));
    roles.set(roleTemplate.name, role);
  }
  return roles;
}

async function ensureCategory(guild, categoryTemplate, roles) {
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name.toLowerCase() === categoryTemplate.name.toLowerCase(),
  );
  if (existing) return existing;

  return guild.channels.create({
    name: categoryTemplate.name,
    type: ChannelType.GuildCategory,
    permissionOverwrites: categoryTemplate.staffOnly ? staffOnlyOverwrites(guild, roles) : [],
    reason: "Logic Systems server template setup",
  });
}

async function ensureTextChannel(guild, category, name, topic, staffOnly, roles) {
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && channel.name === name,
  );
  if (existing) return existing;

  return guild.channels.create({
    name,
    type: ChannelType.GuildText,
    parent: category.id,
    topic,
    permissionOverwrites: staffOnly ? staffOnlyOverwrites(guild, roles) : [],
    reason: "Logic Systems server template setup",
  });
}

async function ensureVoiceChannels(guild, roles) {
  const voiceChannels = [
    ["Support VC", false],
    ["Waiting Room", false],
    ["Staff VC", true],
  ];

  for (const [name, staffOnly] of voiceChannels) {
    const existing = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildVoice && channel.name === name);
    if (existing) continue;

    await guild.channels.create({
      name,
      type: ChannelType.GuildVoice,
      permissionOverwrites: staffOnly ? staffOnlyOverwrites(guild, roles) : [],
      reason: "Logic Systems server template setup",
    });
  }
}

async function postStarterMessages(guild) {
  await sendOnce(
    guild,
    "rules",
    "Logic Systems Rules",
    "1. Be respectful.\n2. No spam, raids, or random staff pings.\n3. Bot requests are free, but staff can deny unclear requests.\n4. Do not claim our systems or branding as your own.\n5. Open a ticket for support.\n6. Follow Discord Terms of Service.",
  );

  await sendOnce(
    guild,
    "request-a-bot",
    "Free Custom Bot Request",
    "**Server Name:**\n**Discord Invite:**\n**Bot Name:**\n**Bot Style:**\n**Main Color:**\n**Commands Wanted:**\n**Staff Roles:**\n**Channels Needed:**\n**Extra Notes:**",
  );

  await sendOnce(
    guild,
    "create-ticket",
    "Support Tickets",
    "Need help with a bot, request, setup, or dashboard issue? Open a ticket and include your server name, what you need, screenshots if something is broken, and the command or dashboard setting involved.",
  );

  await sendOnce(
    guild,
    "service-info",
    "Logic Systems Services",
    "Free custom Roblox RP bots with startup, release, reinvites, staff tools, tickets, dashboard command templates, and custom embeds.",
  );
}

async function sendOnce(guild, channelName, title, description) {
  const channel = guild.channels.cache.find((item) => item.type === ChannelType.GuildText && item.name === channelName);
  if (!channel) return;

  const recent = await channel.messages.fetch({ limit: 20 }).catch(() => null);
  if (recent?.some((message) => message.author.id === guild.client.user.id && message.embeds[0]?.title === title)) return;

  await channel.send({
    embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle(title).setDescription(description).setFooter({ text: "Powered by Logic Systems" })],
  });
}

function staffOnlyOverwrites(guild, roles) {
  const staffRoles = ["Logic Owner", "Logic Administrator", "Logic Manager", "Developer", "Support Team", "Trial Support"]
    .map((name) => roles.get(name)?.id)
    .filter(Boolean);

  return [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    ...staffRoles.map((id) => ({
      id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    })),
  ];
}
