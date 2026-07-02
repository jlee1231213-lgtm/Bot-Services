import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("supervise")
  .setDescription("Post a supervision notice.")
  .addUserOption((option) => option.setName("user").setDescription("User being supervised").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Supervision reason").setRequired(false))
  .addStringOption((option) => option.setName("duration").setDescription("Duration").setRequired(false));

export async function execute(interaction) {
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Supervision Notice",
        buildMessage(`${interaction.options.getUser("user", true)} is being supervised.`, [
          ["Reason", interaction.options.getString("reason")],
          ["Duration", interaction.options.getString("duration")],
          ["Supervisor", interaction.user],
        ]),
      ),
    ],
  });
}
