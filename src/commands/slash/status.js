import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("Check the bot and free service status for this server.")
.addStringOption(option =>
            option.setName('activity')
                .setDescription('The activity type')
                .setRequired(false)
                .addChoices(
                    { name: 'Playing', value: 'PLAYING' },
                    { name: 'Watching', value: 'WATCHING' },
                    { name: 'Listening', value: 'LISTENING' },
                    { name: 'Competing', value: 'COMPETING' },
                )).addStringOption(option =>
            option.setName('message')
                .setDescription('The status message to display')
                .setRequired(false));

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
