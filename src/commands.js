import { SlashCommandBuilder } from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("startup")
    .setDescription("Post a roleplay startup message."),
  new SlashCommandBuilder()
    .setName("ea")
    .setDescription("Post an early access roleplay message."),
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Show the basic Logic Systems setup steps."),
  new SlashCommandBuilder()
    .setName("release")
    .setDescription("Post a roleplay release message."),
  new SlashCommandBuilder()
    .setName("reinvites")
    .setDescription("Post a reinvite notice."),
  new SlashCommandBuilder()
    .setName("over")
    .setDescription("Post a session over message."),
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
].map((command) => command.toJSON());
