import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("antiraid")
  .setDescription("Check free anti-raid protection status.");

export async function execute(interaction) {
  await interaction.reply({
    embeds: [await standardEmbed(interaction.guildId, "Anti-Raid Status", "Free anti-raid status tools are enabled for this server.")],
    ephemeral: true,
  });
}
