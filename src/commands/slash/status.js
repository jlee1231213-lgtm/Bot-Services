import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("Check the bot and free service status for this server.");

export async function execute(interaction) {
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x76f0d2)
        .setTitle("Logic Systems Status")
        .setDescription("Service is online.\nPackage: Free Custom Bot\nCustom embeds: Available\nRoleplay tools: Available")
        .setFooter({ text: "Logic Systems Free" }),
    ],
    ephemeral: true,
  });
}
