import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { brandColor, parseHexColor } from "./_shared.js";

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
  const footer = interaction.options.getString("footer") ?? "Logic Systems Free";
  const color = parseHexColor(interaction.options.getString("color")) ?? brandColor;

  await interaction.reply({
    embeds: [new EmbedBuilder().setColor(color).setTitle(title).setDescription(message).setFooter({ text: footer })],
  });
}
