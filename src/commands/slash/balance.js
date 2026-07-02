import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("balance")
  .setDescription("Show a customizable RP wallet/balance card.")
  .addUserOption((option) => option.setName("user").setDescription("User to show").setRequired(false))
  .addNumberOption((option) => option.setName("cash").setDescription("Cash amount").setRequired(false))
  .addNumberOption((option) => option.setName("bank").setDescription("Bank amount").setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user") ?? interaction.user;
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "RP Balance",
        buildMessage(`${user}'s roleplay wallet`, [
          ["Cash", money(interaction.options.getNumber("cash")) ?? "$0"],
          ["Bank", money(interaction.options.getNumber("bank")) ?? "$0"],
        ]),
      ),
    ],
    ephemeral: true,
  });
}

function money(value) {
  return value == null ? null : `$${value.toLocaleString()}`;
}
