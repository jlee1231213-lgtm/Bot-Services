import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("lowmod")
  .setDescription("Announce that the session has low moderator coverage.")
  .addStringOption((option) => option.setName("needed").setDescription("How many moderators are needed.").setRequired(false))
  .addStringOption((option) => option.setName("notes").setDescription("Extra instructions for staff.").setRequired(false));

export async function execute(interaction) {
  const description = buildMessage("Moderator coverage is low. Available staff should assist the session when possible.", [
    ["Needed", interaction.options.getString("needed")],
    ["Notes", interaction.options.getString("notes")],
  ]);

  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Low Moderation", description)] });
}
