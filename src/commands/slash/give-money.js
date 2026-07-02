import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("give-money")
  .setDescription("Post a roleplay money transfer receipt.")
  .addUserOption((option) => option.setName("user").setDescription("User receiving money").setRequired(true))
  .addNumberOption((option) => option.setName("amount").setDescription("Amount to give").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Transfer reason").setRequired(false));

export async function execute(interaction) {
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Money Transfer",
        buildMessage(`${interaction.user} transferred money.`, [
          ["Recipient", interaction.options.getUser("user", true)],
          ["Amount", `$${interaction.options.getNumber("amount", true).toLocaleString()}`],
          ["Reason", interaction.options.getString("reason")],
        ]),
      ),
    ],
  });
}
