import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("membercount")
  .setDescription("Show the server member count.");

export async function execute(interaction) {
  await interaction.reply({
    embeds: [await standardEmbed(interaction.guildId, "Member Count", `This server has **${interaction.guild.memberCount.toLocaleString()}** members.`)],
  });
}
