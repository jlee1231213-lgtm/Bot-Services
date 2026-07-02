import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("quota")
  .setDescription("Post a staff quota update.")
  .addUserOption((option) => option.setName("user").setDescription("Staff member").setRequired(false))
  .addIntegerOption((option) => option.setName("completed").setDescription("Completed amount").setRequired(false).setMinValue(0))
  .addIntegerOption((option) => option.setName("required").setDescription("Required amount").setRequired(false).setMinValue(0))
  .addStringOption((option) => option.setName("notes").setDescription("Quota notes").setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user") ?? interaction.user;
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Staff Quota",
        buildMessage(`${user}'s quota update`, [
          ["Completed", interaction.options.getInteger("completed")],
          ["Required", interaction.options.getInteger("required")],
          ["Notes", interaction.options.getString("notes")],
        ]),
      ),
    ],
  });
}
