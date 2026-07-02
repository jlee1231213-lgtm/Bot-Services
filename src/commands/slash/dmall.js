import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("dmall")
  .setDescription("Create a mass-DM announcement template for staff review.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) => option.setName("title").setDescription("Announcement title").setRequired(true))
  .addStringOption((option) => option.setName("message").setDescription("Announcement message").setRequired(true));

export async function execute(interaction) {
  await interaction.reply({
    embeds: [await standardEmbed(interaction.guildId, interaction.options.getString("title", true), interaction.options.getString("message", true))],
    ephemeral: true,
  });
}
