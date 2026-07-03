import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("modcall")
  .setDescription("Request moderators for an active RP session.")
  .addStringOption((option) => option.setName("reason").setDescription("Why moderators are needed.").setRequired(false))
  .addStringOption((option) => option.setName("location").setDescription("Where staff should respond.").setRequired(false))
  .addStringOption((option) => option.setName("notes").setDescription("Extra instructions for staff.").setRequired(false));

export async function execute(interaction) {
  const description = buildMessage("Moderators are needed for the current roleplay session.", [
    ["Reason", interaction.options.getString("reason")],
    ["Location", interaction.options.getString("location")],
    ["Notes", interaction.options.getString("notes")],
  ]);

  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Moderator Call", description)] });
}
