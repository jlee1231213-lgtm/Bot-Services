import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("withdraw")
  .setDescription("Post a roleplay withdrawal receipt.")
  .addNumberOption((option) => option.setName("amount").setDescription("Withdrawal amount").setRequired(true));

export async function execute(interaction) {
  const amount = interaction.options.getNumber("amount", true);
  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Withdrawal Receipt", `${interaction.user} withdrew **$${amount.toLocaleString()}**.`)], ephemeral: true });
}
