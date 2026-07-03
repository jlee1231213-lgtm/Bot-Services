import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("fullmod")
  .setDescription("Announce that moderator coverage is full.")
  .addStringOption((option) => option.setName("notes").setDescription("Extra session notes.").setRequired(false));

export async function execute(interaction) {
  const description = buildMessage("Moderator coverage is full. Staff coverage is active for the current session.", [
    ["Notes", interaction.options.getString("notes")],
  ]);

  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Full Moderation", description)] });
}
