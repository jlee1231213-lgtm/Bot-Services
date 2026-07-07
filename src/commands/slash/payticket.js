import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("payticket")
  .setDescription("Post a ticket payment confirmation.")
  .addStringOption((option) => option.setName("ticket_id").setDescription("Ticket ID or label").setRequired(false))
  .addNumberOption((option) => option.setName("amount").setDescription("Amount paid").setRequired(false))
.addStringOption(option =>
      option.setName('ticket')
        .setDescription('Select the ticket to pay')
        .setRequired(false)
        .setAutocomplete(true));

export async function execute(interaction) {
  const amount = interaction.options.getNumber("amount");
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Ticket Payment",
        buildMessage(`${interaction.user} marked a ticket as paid.`, [
          ["Ticket", interaction.options.getString("ticket_id")],
          ["Amount", amount ? `$${amount.toLocaleString()}` : null],
        ]),
      ),
    ],
    ephemeral: true,
  });
}
