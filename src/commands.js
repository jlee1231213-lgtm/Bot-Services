import { SlashCommandBuilder } from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("startup")
    .setDescription("Post a roleplay startup message.")
    .addStringOption((option) =>
      option.setName("notes").setDescription("Extra startup notes").setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("ea")
    .setDescription("Post an early access roleplay message."),
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Show the basic Logic Systems setup steps."),
  new SlashCommandBuilder()
    .setName("release")
    .setDescription("Post a roleplay release message.")
    .addStringOption((option) =>
      option.setName("notes").setDescription("Extra release notes").setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("reinvites")
    .setDescription("Post a reinvite notice.")
    .addStringOption((option) =>
      option.setName("notes").setDescription("Extra reinvite notes").setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("over")
    .setDescription("Post a session over message.")
    .addStringOption((option) =>
      option.setName("notes").setDescription("Extra closing notes").setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show Logic Systems commands and plan info."),
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check the bot and premium status for this server."),
  new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Post a clean roleplay rules reminder."),
  new SlashCommandBuilder()
    .setName("peacetime")
    .setDescription("Announce peacetime status.")
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("Whether peacetime is on or off.")
        .setRequired(true)
        .addChoices(
          { name: "On", value: "on" },
          { name: "Off", value: "off" },
        ),
    ),
  new SlashCommandBuilder()
    .setName("ssu")
    .setDescription("Post a server startup announcement with optional notes.")
    .addStringOption((option) =>
      option.setName("notes").setDescription("Extra startup notes").setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("vote")
    .setDescription("Start a simple roleplay session vote.")
    .addStringOption((option) =>
      option.setName("question").setDescription("Vote question").setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("priority")
    .setDescription("Announce priority scene status.")
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("Current priority status.")
        .setRequired(true)
        .addChoices(
          { name: "Available", value: "available" },
          { name: "Cooldown", value: "cooldown" },
          { name: "Hold", value: "hold" },
        ),
    ),
  new SlashCommandBuilder()
    .setName("scene")
    .setDescription("Post a scene announcement.")
    .addStringOption((option) =>
      option.setName("location").setDescription("Scene location").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("details").setDescription("Scene details").setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("staff")
    .setDescription("Post a staff announcement.")
    .addStringOption((option) =>
      option.setName("message").setDescription("Staff message").setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Premium: create a custom embed.")
    .addStringOption((option) =>
      option.setName("title").setDescription("Embed title").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("message").setDescription("Embed message").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("color").setDescription("Hex color, like #3c43ec").setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("antiraid")
    .setDescription("Premium: check anti-raid protection status."),
  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Premium: post a custom announcement embed.")
    .addStringOption((option) =>
      option.setName("title").setDescription("Announcement title").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("message").setDescription("Announcement message").setRequired(true),
    ),
].map((command) => command.toJSON());
