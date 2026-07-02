import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("unregister")
  .setDescription("Unregister a roleplay vehicle/profile entry.")
  .addStringOption((option) => option.setName("identifier").setDescription("Plate, callsign, or ID").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Removal reason").setRequired(false));

export async function execute(interaction) {
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Registration Removed",
        buildMessage(`${interaction.user} removed a registration.`, [
          ["Identifier", interaction.options.getString("identifier", true)],
          ["Reason", interaction.options.getString("reason")],
        ]),
      ),
    ],
  });
}
