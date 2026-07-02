import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("staff-profile")
  .setDescription("Create a custom staff profile card.")
  .addUserOption((option) => option.setName("user").setDescription("Staff member").setRequired(false))
  .addStringOption((option) => option.setName("rank").setDescription("Staff rank").setRequired(false))
  .addStringOption((option) => option.setName("department").setDescription("Department or team").setRequired(false))
  .addStringOption((option) => option.setName("timezone").setDescription("Timezone").setRequired(false))
  .addStringOption((option) => option.setName("notes").setDescription("Extra staff notes").setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user") ?? interaction.user;
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Staff Profile",
        buildMessage(`${user}'s staff profile`, [
          ["Rank", interaction.options.getString("rank")],
          ["Department", interaction.options.getString("department")],
          ["Timezone", interaction.options.getString("timezone")],
          ["Notes", interaction.options.getString("notes")],
        ]),
      ),
    ],
  });
}
