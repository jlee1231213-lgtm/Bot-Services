import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("ticket")
  .setDescription("Issue a customizable roleplay ticket/fine.")
  .addUserOption((option) => option.setName("user").setDescription("User receiving the ticket").setRequired(true))
  .addStringOption((option) => option.setName("offense").setDescription("Offense/reason").setRequired(true))
  .addNumberOption((option) => option.setName("amount").setDescription("Fine amount").setRequired(false))
  .addStringOption((option) => option.setName("notes").setDescription("Extra ticket notes").setRequired(false))
.addNumberOption(option =>
      option.setName('price')
        .setDescription('Amount of the fine')
        .setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user", true);
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Roleplay Ticket",
        buildMessage(`${user} has received a ticket.`, [
          ["Offense", interaction.options.getString("offense", true)],
          ["Amount", formatMoney(interaction.options.getNumber("amount"))],
          ["Officer", interaction.user],
          ["Notes", interaction.options.getString("notes")],
        ]),
      ),
    ],
  });
}

function formatMoney(value) {
  return value ? `$${value.toLocaleString()}` : null;
}
