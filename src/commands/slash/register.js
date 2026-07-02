import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("register")
  .setDescription("Register a roleplay vehicle/profile entry.")
  .addStringOption((option) => option.setName("type").setDescription("Vehicle, character, or department").setRequired(true))
  .addStringOption((option) => option.setName("name").setDescription("Name/model/title").setRequired(true))
  .addStringOption((option) => option.setName("details").setDescription("Extra details").setRequired(false))
  .addStringOption((option) => option.setName("identifier").setDescription("Plate, callsign, or ID").setRequired(false));

export async function execute(interaction) {
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Registration Submitted",
        buildMessage(`${interaction.user} submitted a registration.`, [
          ["Type", interaction.options.getString("type", true)],
          ["Name", interaction.options.getString("name", true)],
          ["Identifier", interaction.options.getString("identifier")],
          ["Details", interaction.options.getString("details")],
        ]),
      ),
    ],
  });
}
