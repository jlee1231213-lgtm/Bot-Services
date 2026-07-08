import { createReadStream, existsSync } from "node:fs";
import { PassThrough } from "node:stream";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import PImage from "pureimage";

const setupImageFont = loadSetupImageFont();
const logicSystemsColor = 0x5865f2;
const setupFooter = "Powered by Logic Systems • Owned by Pnkstrz_._";
const ticketButtonId = "logic_systems_open_ticket";
const staffRoleNames = ["Logic Owner", "Logic Director", "Build Lead", "Senior Support", "Support Specialist", "Trial Support"];
const customerRoleNames = ["Customer", "Bot Owner", "Partner"];

const serviceRoles = [
  { name: "Logic Owner", color: 0x5865f2, hoist: true, permissions: [PermissionFlagsBits.Administrator] },
  {
    name: "Logic Director",
    color: 0x64d8ff,
    hoist: true,
    permissions: [
      PermissionFlagsBits.ManageGuild,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ManageThreads,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.BanMembers,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.ViewAuditLog,
      PermissionFlagsBits.MentionEveryone,
    ],
  },
  {
    name: "Build Lead",
    color: 0x23c46e,
    hoist: true,
    permissions: [
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ManageThreads,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.MoveMembers,
      PermissionFlagsBits.MuteMembers,
      PermissionFlagsBits.DeafenMembers,
    ],
  },
  {
    name: "Senior Support",
    color: 0xf2c94c,
    hoist: true,
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.ManageWebhooks,
    ],
  },
  {
    name: "Support Specialist",
    color: 0x9b8cff,
    hoist: true,
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.CreatePrivateThreads,
      PermissionFlagsBits.CreatePublicThreads,
    ],
  },
  {
    name: "Trial Support",
    color: 0xaeb6cc,
    hoist: false,
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.EmbedLinks,
    ],
  },
  { name: "Customer", color: 0x76f0d2, hoist: false, permissions: [] },
  { name: "Bot Owner", color: 0xff9f43, hoist: false, permissions: [] },
  { name: "Pending Request", color: 0xffd166, hoist: false, permissions: [] },
  { name: "Completed Request", color: 0x23c46e, hoist: false, permissions: [] },
  { name: "Announcements Ping", color: 0x5865f2, hoist: false, permissions: [] },
  { name: "Updates Ping", color: 0x64d8ff, hoist: false, permissions: [] },
  { name: "Support Ping", color: 0xff6b6b, hoist: false, permissions: [] },
  { name: "Partner", color: 0x9b8cff, hoist: false, permissions: [] },
];

const serviceCategories = [
  {
    name: "Start Here",
    channels: [
      ["welcome", "Start here for Logic Systems info, links, and next steps."],
      ["rules", "Server rules and service expectations."],
      ["service-info", "What Logic Systems provides and how free bot builds work."],
      ["faq", "Common questions about free custom bots, timelines, and support."],
    ],
  },
  {
    name: "Updates",
    channels: [
      ["announcements", "Major Logic Systems notices and important service updates."],
      ["status", "Live service status, outages, cooldowns, and maintenance notes."],
      ["showcase", "Finished bots, previews, dashboard screenshots, and demos."],
      ["vouches", "Public customer feedback and service reviews."],
    ],
  },
  {
    name: "Support Desk",
    channels: [
      ["create-ticket", "Open support for setup, dashboard, OAuth, bot, and command issues."],
      ["support-status", "Support availability, queue status, and wait times."],
      ["bug-reports", "Report broken commands, website issues, or Discord setup problems."],
      ["suggestions", "Suggest commands, dashboard options, or service ideas."],
    ],
  },
  {
    name: "Bot Requests",
    channels: [
      ["request-a-bot", "Request a free custom bot using the format posted here."],
      ["request-status", "Public queue updates for pending custom bot requests."],
      ["finished-bots", "Completed custom bot deliveries and handoff notes."],
      ["customer-info", "Customer instructions for dashboards, setup, and bot invites."],
    ],
  },
  {
    name: "Community",
    channels: [
      ["general", "Community chat."],
      ["media", "Images, clips, and server previews."],
      ["partnerships", "Partnership requests and ads approved by staff."],
    ],
  },
  {
    name: "Staff HQ",
    staffOnly: true,
    channels: [
      ["staff-chat", "Private staff discussion."],
      ["staff-announcements", "Internal announcements and staff reminders."],
      ["request-intake", "New custom bot requests waiting for review."],
      ["active-builds", "Requests currently being built or configured."],
      ["build-review", "Final QA, screenshots, and handoff checks."],
      ["staff-logs", "Internal staff logs."],
      ["admin-notes", "Owner and admin notes."],
    ],
  },
];

const voiceChannelTemplates = [
  { name: "Support Waiting Room", staffOnly: false, category: "Support Desk" },
  { name: "Customer Support VC", staffOnly: false, category: "Support Desk" },
  { name: "Staff Build Room", staffOnly: true, category: "Staff HQ" },
  { name: "Staff Meeting Room", staffOnly: true, category: "Staff HQ" },
];

const starterMessages = [
  {
    channelName: "rules",
    title: "Logic Systems Rules",
    description:
      "1. Be respectful.\n2. No spam, raids, or random staff pings.\n3. Bot requests are free, but staff can deny unclear requests.\n4. Do not claim our systems or branding as your own.\n5. Open a ticket for support.\n6. Follow Discord Terms of Service.",
  },
  {
    channelName: "request-a-bot",
    title: "Free Custom Bot Request",
    description:
      "**Server Name:**\n**Discord Invite:**\n**Bot Name:**\n**Bot Style:**\n**Main Color:**\n**Commands Wanted:**\n**Staff Roles:**\n**Channels Needed:**\n**Extra Notes:**",
  },
  {
    channelName: "create-ticket",
    title: "Create a Support Ticket",
    description:
      "Need help with a bot, dashboard, OAuth login, setup, command error, or request update? Press the button below to open a private support ticket.",
    fields: [
      ["What to include", "Server name, Discord invite, bot name, and what you need fixed or changed."],
      ["For bugs", "Send screenshots, the command name, the error message, and what you expected to happen."],
      ["For setup help", "Tell us which channels, roles, embeds, or dashboard settings you want changed."],
      ["Safety reminder", "Never send your Discord password or bot token in a ticket."],
    ],
  },
  {
    channelName: "service-info",
    title: "Logic Systems Services",
    description: "Free custom Roblox RP bots with startup, release, reinvites, staff tools, tickets, dashboard command templates, and custom embeds.",
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

  if (!isLogicSystemsGuild(interaction.guildId)) {
    await interaction.reply({
      content:
        "This `/setup` command is locked to the official Logic Systems Discord server. Customer servers should use the dashboard and normal bot commands instead.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (template === "preview") {
    const image = await setupTemplateImage();
    await interaction.reply({
      embeds: [previewEmbed().setImage("attachment://logic-systems-setup-template.png")],
      files: [image],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (
    !interaction.guild.members.me.permissions.has(
      PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageGuild,
    )
  ) {
    await interaction.reply({
      content: "I need `Manage Guild`, `Manage Channels`, and `Manage Roles` before I can rebuild the server template.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const roles = await ensureRoles(interaction.guild);
  const deletedChannels = await deleteExistingChannels(interaction.guild);
  const createdChannels = [];
  const categoryMap = new Map();

  for (const categoryTemplate of serviceCategories) {
    const category = await ensureCategory(interaction.guild, categoryTemplate, roles);
    categoryMap.set(categoryTemplate.name, category);

    for (const [channelName, topic] of categoryTemplate.channels) {
      const channel = await ensureTextChannel(interaction.guild, category, channelName, topic, categoryTemplate.staffOnly, roles);
      createdChannels.push(channel);
    }
  }

  await ensureVoiceChannels(interaction.guild, roles, categoryMap);
  await postStarterMessages(interaction.guild);

  const image = await setupTemplateImage();
  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(logicSystemsColor)
        .setTitle("Logic Systems Server Template Created")
        .setDescription(
          `Deleted **${deletedChannels}** existing channels, rebuilt **${serviceRoles.length} roles**, **${serviceCategories.length} categories**, **${createdChannels.length} text channels**, and sent the starter embeds with channel-themed images.\n\nNext: place your staff above the bot role if needed, add your logo/banner, and run \`/settings\` to customize bot embeds.`,
        )
        .setImage("attachment://logic-systems-setup-template.png")
        .setFooter({ text: setupFooter }),
    ],
    files: [image],
  });
}

function previewEmbed() {
  return new EmbedBuilder()
    .setColor(logicSystemsColor)
    .setTitle("Logic Systems Bot-Service Template")
    .setDescription(
      [
        "**Creates categories:** Start Here, Updates, Support Desk, Bot Requests, Community, Staff HQ",
        "**Creates staff roles:** Owner, Director, Build Lead, Senior Support, Support Specialist, Trial Support",
        "**Creates customer roles:** Customer, Bot Owner, Partner, request statuses, and ping roles",
        "**Posts starter messages:** rules, request format, ticket intake, and service info",
        "",
        "Run `/setup template:create` to build it.",
      ].join("\n"),
    )
    .setFooter({ text: setupFooter });
}

function isLogicSystemsGuild(guildId) {
  const allowedGuildIds = [
    process.env.LOGIC_SYSTEMS_GUILD_ID,
    process.env.DISCORD_GUILD_ID,
  ]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  return allowedGuildIds.length > 0 && allowedGuildIds.includes(String(guildId));
}

async function setupTemplateImage() {
  const buffer = await renderSetupTemplateImage();
  return new AttachmentBuilder(buffer, { name: "logic-systems-setup-template.png" });
}

async function renderSetupTemplateImage() {
  const width = 1983;
  const height = 793;
  const image = PImage.make(width, height);
  const context = image.getContext("2d");
  const background = await PImage.decodePNGFromStream(createReadStream("logic-systems-banner-logo-next-to-text-clean.png"));

  context.drawImage(background, 0, 0, width, height);
  context.fillStyle = "rgba(33, 40, 210, 0.44)";
  context.fillRect(0, 0, width, height);

  drawText(context, "LOGIC SYSTEMS", 116, 125, 48, "rgba(255,255,255,0.82)");
  drawText(context, "STAFF SERVER SETUP", 116, 190, 88, "#ffffff");
  drawText(context, "Official Logic Systems staff, support, and bot-request workspace", 120, 292, 34, "rgba(255,255,255,0.82)");

  const columnWidth = 280;
  const startX = 104;
  const startY = 382;
  const columnGap = 22;

  for (const [index, category] of serviceCategories.entries()) {
    const x = startX + index * (columnWidth + columnGap);
    drawPanel(context, x, startY, columnWidth, 280);
    drawText(context, category.name.toUpperCase(), x + 22, startY + 48, 25, "#ffffff");

    const channels = category.channels.map(([name]) => `# ${name}`);
    drawWrappedList(context, channels, x + 24, startY + 88, columnWidth - 48, 22, 27);
  }

  return encodePng(image);
}

function drawPanel(context, x, y, width, height) {
  context.fillStyle = "#3037e0";
  context.fillRect(x, y, width, height);
  context.strokeStyle = "rgba(255,255,255,0.32)";
  context.lineWidth = 2;
  context.strokeRect(x, y, width, height);
}

function drawWrappedList(context, lines, x, y, maxWidth, fontSize, lineHeight) {
  let currentY = y;
  for (const line of lines) {
    for (const wrappedLine of wrapText(context, line, maxWidth, fontSize)) {
      drawText(context, wrappedLine, x, currentY, fontSize, "rgba(255,255,255,0.9)");
      currentY += lineHeight;
    }
  }
}

function wrapText(context, text, maxWidth, fontSize) {
  context.font = `${fontSize}px ${setupImageFont}`;
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;
    if (context.measureText(nextLine).width <= maxWidth) {
      line = nextLine;
      continue;
    }
    if (line) lines.push(line);
    line = word;
  }

  if (line) lines.push(line);
  return lines;
}

function drawText(context, text, x, y, size, color) {
  context.fillStyle = color;
  context.font = `${size}px ${setupImageFont}`;
  context.fillText(text, x, y);
}

function loadSetupImageFont() {
  const fontCandidates = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/SFNS.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
  ];

  const fontPath = fontCandidates.find((candidate) => existsSync(candidate));
  if (!fontPath) return "sans-serif";

  PImage.registerFont(fontPath, "LogicSetup").loadSync();
  return "LogicSetup";
}

function encodePng(image) {
  return new Promise((resolve, reject) => {
    const stream = new PassThrough();
    const chunks = [];

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);

    PImage.encodePNGToStream(image, stream).catch(reject);
  });
}

async function ensureRoles(guild) {
  const roles = new Map();
  for (const roleTemplate of serviceRoles) {
    const existing = guild.roles.cache.find((role) => role.name === roleTemplate.name);
    const role = existing
      ? await existing.edit({
          colors: { primaryColor: roleTemplate.color },
          hoist: roleTemplate.hoist,
          mentionable: roleTemplate.name.includes("Ping"),
          permissions: roleTemplate.permissions,
          reason: "Logic Systems server template setup",
        })
      : await guild.roles.create({
        name: roleTemplate.name,
        colors: { primaryColor: roleTemplate.color },
        hoist: roleTemplate.hoist,
        mentionable: roleTemplate.name.includes("Ping"),
        permissions: roleTemplate.permissions,
        reason: "Logic Systems server template setup",
      });
    roles.set(roleTemplate.name, role);
  }
  return roles;
}

async function deleteExistingChannels(guild) {
  const channels = [...guild.channels.cache.values()].sort((a, b) => {
    if (a.type === ChannelType.GuildCategory && b.type !== ChannelType.GuildCategory) return 1;
    if (a.type !== ChannelType.GuildCategory && b.type === ChannelType.GuildCategory) return -1;
    return 0;
  });

  let deleted = 0;

  for (const channel of channels) {
    if (!channel.deletable) continue;
    await channel.delete("Logic Systems setup rebuilding server layout");
    deleted += 1;
  }

  return deleted;
}

async function ensureCategory(guild, categoryTemplate, roles) {
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name.toLowerCase() === categoryTemplate.name.toLowerCase(),
  );
  if (existing) return existing;

  return guild.channels.create({
    name: categoryTemplate.name,
    type: ChannelType.GuildCategory,
    permissionOverwrites: categoryTemplate.staffOnly ? staffOnlyOverwrites(guild, roles) : publicChannelOverwrites(guild, roles),
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
    permissionOverwrites: staffOnly ? staffOnlyOverwrites(guild, roles) : publicChannelOverwrites(guild, roles),
    reason: "Logic Systems server template setup",
  });
}

async function ensureVoiceChannels(guild, roles, categoryMap) {
  for (const template of voiceChannelTemplates) {
    const existing = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildVoice && channel.name === template.name);
    if (existing) continue;

    await guild.channels.create({
      name: template.name,
      type: ChannelType.GuildVoice,
      parent: categoryMap.get(template.category)?.id,
      permissionOverwrites: template.staffOnly ? staffVoiceOverwrites(guild, roles) : publicVoiceOverwrites(guild, roles),
      reason: "Logic Systems server template setup",
    });
  }
}

async function postStarterMessages(guild) {
  for (const message of starterMessages) {
    await sendOnce(guild, message);
  }
}

async function sendOnce(guild, { channelName, title, description, fields = [] }) {
  const channel = guild.channels.cache.find((item) => item.type === ChannelType.GuildText && item.name === channelName);
  if (!channel) return;

  const recent = await channel.messages.fetch({ limit: 20 }).catch(() => null);
  if (recent?.some((message) => message.author.id === guild.client.user.id && message.embeds[0]?.title === title)) return;

  const imageName = `${channelName}-info-card.png`;
  const image = await starterChannelImage(channelName);
  const embed = new EmbedBuilder()
    .setColor(logicSystemsColor)
    .setTitle(title)
    .setDescription(description)
    .setImage(`attachment://${imageName}`)
    .setFooter({ text: setupFooter });

  if (fields.length) {
    embed.addFields(fields.map(([name, value]) => ({ name, value })));
  }

  const components = channelName === "create-ticket"
    ? [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(ticketButtonId)
            .setLabel("Open Support Ticket")
            .setStyle(ButtonStyle.Primary),
        ),
      ]
    : [];

  await channel.send({
    embeds: [embed],
    files: [new AttachmentBuilder(image, { name: imageName })],
    components,
  });
}

function publicChannelOverwrites(guild, roles) {
  const customerRoles = customerRoleNames
    .map((name) => roles.get(name)?.id)
    .filter(Boolean);

  const publicStaffRoles = staffRoleNames
    .map((name) => roles.get(name)?.id)
    .filter(Boolean);

  return [
    {
      id: guild.roles.everyone.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
      deny: [PermissionFlagsBits.SendTTSMessages],
    },
    ...customerRoles.map((id) => ({
      id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    })),
    ...publicStaffRoles.map((id) => ({
      id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ManageMessages,
      ],
    })),
  ];
}

function staffOnlyOverwrites(guild, roles) {
  const staffRoles = staffRoleNames
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

function publicVoiceOverwrites(guild, roles) {
  const staffRoles = staffRoleNames
    .map((name) => roles.get(name)?.id)
    .filter(Boolean);

  const customerRoles = customerRoleNames
    .map((name) => roles.get(name)?.id)
    .filter(Boolean);

  return [
    {
      id: guild.roles.everyone.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
    },
    ...customerRoles.map((id) => ({
      id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
    })),
    ...staffRoles.map((id) => ({
      id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.MoveMembers,
        PermissionFlagsBits.MuteMembers,
        PermissionFlagsBits.DeafenMembers,
      ],
    })),
  ];
}

function staffVoiceOverwrites(guild, roles) {
  const staffRoles = staffRoleNames
    .map((name) => roles.get(name)?.id)
    .filter(Boolean);

  return [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
    },
    ...staffRoles.map((id) => ({
      id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.MoveMembers,
        PermissionFlagsBits.MuteMembers,
        PermissionFlagsBits.DeafenMembers,
      ],
    })),
  ];
}

async function starterChannelImage(channelName, color) {
  const width = 1983;
  const height = 793;
  const image = PImage.make(width, height);
  const context = image.getContext("2d");
  const headline = `#${channelName}`;
  const ownerText = "Owned by Pnkstrz_._";
  const background = await PImage.decodePNGFromStream(createReadStream("logic-systems-banner-logo-next-to-text-clean.png"));
  const headlineWidth = measureText(context, headline, 120);
  const ownerWidth = measureText(context, ownerText, 28);

  context.drawImage(background, 0, 0, width, height);

  context.fillStyle = "rgba(20, 26, 180, 0.16)";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(255,255,255,0.10)";
  roundRect(context, 560, 332, 860, 72, 22);
  context.fill();

  drawText(context, headline, (width - headlineWidth) / 2, 378, 120, "#ffffff");

  context.fillStyle = "rgba(255,255,255,0.14)";
  roundRect(context, 804, 610, 376, 56, 18);
  context.fill();
  drawText(context, ownerText, (width - ownerWidth) / 2, 648, 28, "rgba(255,255,255,0.92)");

  return encodePng(image);
}

function measureText(context, text, size) {
  context.font = `${size}px ${setupImageFont}`;
  return context.measureText(text).width;
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}
