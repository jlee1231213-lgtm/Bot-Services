import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("deposit")
  .setDescription("Post a roleplay deposit receipt.")
  .addNumberOption((option) => option.setName("amount").setDescription("Deposit amount").setRequired(true));

export async function execute(interaction) {
  const amount = interaction.options.getNumber("amount", true);
  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Deposit Receipt", `${interaction.user} deposited **$${amount.toLocaleString()}**.`)], ephemeral: true });
}
