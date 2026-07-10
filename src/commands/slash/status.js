import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("Check the bot and free service status for this server.");

export async function execute(interaction) {
  await interaction.reply({
    embeds: [await standardEmbed(
      interaction.guildId,
      "Server Status",
      "Service is online.\nPackage: Free Custom Bot\nCustom embeds: Available\nRoleplay tools: Available",
    )],
    ephemeral: true,
  });
}
