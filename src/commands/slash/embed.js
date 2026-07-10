import { SlashCommandBuilder } from "discord.js";
import { customEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("embed")
  .setDescription("Create a free custom embed.")
  .addStringOption((option) =>
    option.setName("title").setDescription("Embed title").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("message").setDescription("Embed message").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("footer").setDescription("Embed footer").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("color").setDescription("Hex color, like #5865f2").setRequired(false),
  );

export async function execute(interaction) {
  const title = interaction.options.getString("title", true);
  const message = interaction.options.getString("message", true);
  const footer = interaction.options.getString("footer");
  const color = interaction.options.getString("color");

  await interaction.reply({
    embeds: [await customEmbed(interaction.guildId, { title, description: message, footer, color })],
  });
}
