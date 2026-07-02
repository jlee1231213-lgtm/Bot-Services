import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("reinvites")
  .setDescription("Post a customizable reinvite notice.")
  .addIntegerOption((option) =>
    option.setName("amount").setDescription("How many reinvites are open").setRequired(false).setMinValue(1),
  )
  .addStringOption((option) =>
    option.setName("method").setDescription("How members should rejoin").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("notes").setDescription("Extra reinvite notes").setRequired(false),
  );

export async function execute(interaction) {
  const amount = interaction.options.getInteger("amount");
  const description = buildMessage("Reinvites are open. Use the server instructions to rejoin cleanly.", [
    ["Amount", amount ? `${amount} reinvite${amount === 1 ? "" : "s"}` : null],
    ["Method", interaction.options.getString("method")],
    ["Notes", interaction.options.getString("notes")],
  ]);

  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Reinvites Open", description)] });
}
