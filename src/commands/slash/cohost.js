import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("cohost")
  .setDescription("Announce a session cohost.")
  .addUserOption((option) => option.setName("user").setDescription("Cohost user").setRequired(true))
  .addStringOption((option) => option.setName("session").setDescription("Session name").setRequired(false))
  .addStringOption((option) => option.setName("notes").setDescription("Cohost notes").setRequired(false));

export async function execute(interaction) {
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Cohost Added",
        buildMessage(`${interaction.options.getUser("user", true)} is now cohosting.`, [
          ["Session", interaction.options.getString("session")],
          ["Notes", interaction.options.getString("notes")],
        ]),
      ),
    ],
  });
}
