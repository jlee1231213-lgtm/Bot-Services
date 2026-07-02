import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("release")
  .setDescription("Post a customizable roleplay release message.")
  .addStringOption((option) =>
    option.setName("server_name").setDescription("Roleplay server name").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("server_code").setDescription("Join code or link").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("host").setDescription("Session host").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("notes").setDescription("Extra release notes").setRequired(false),
  );

export async function execute(interaction) {
  const description = buildMessage("The roleplay session has been released. Have fun, stay realistic, and follow the rules.", [
    ["Server", interaction.options.getString("server_name")],
    ["Code", interaction.options.getString("server_code")],
    ["Host", interaction.options.getString("host")],
    ["Notes", interaction.options.getString("notes")],
  ]);

  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Session Release", description)] });
}
