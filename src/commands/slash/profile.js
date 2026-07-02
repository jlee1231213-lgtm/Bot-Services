import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("Create a custom roleplay profile card.")
  .addUserOption((option) => option.setName("user").setDescription("Profile owner").setRequired(false))
  .addStringOption((option) => option.setName("name").setDescription("Character or staff name").setRequired(false))
  .addStringOption((option) => option.setName("department").setDescription("Department or team").setRequired(false))
  .addStringOption((option) => option.setName("callsign").setDescription("Callsign or ID").setRequired(false))
  .addStringOption((option) => option.setName("notes").setDescription("Extra profile notes").setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user") ?? interaction.user;
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Roleplay Profile",
        buildMessage(`${user}'s profile`, [
          ["Name", interaction.options.getString("name")],
          ["Department", interaction.options.getString("department")],
          ["Callsign", interaction.options.getString("callsign")],
          ["Notes", interaction.options.getString("notes")],
        ]),
      ),
    ],
  });
}
