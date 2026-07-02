import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("antiraid")
  .setDescription("Check free anti-raid protection status.");

export async function execute(interaction) {
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x76f0d2)
        .setTitle("Anti-Raid Protection")
        .setDescription("Free anti-raid status tools are enabled for this server.")
        .setFooter({ text: "Logic Systems Free" }),
    ],
    ephemeral: true,
  });
}
