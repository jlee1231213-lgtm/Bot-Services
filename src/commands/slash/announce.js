import { SlashCommandBuilder } from "discord.js";
import { customEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("announce")
  .setDescription("Post a free custom announcement embed.")
  .addStringOption((option) =>
    option.setName("title").setDescription("Announcement title").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("message").setDescription("Announcement message").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("footer").setDescription("Optional footer override").setRequired(false),
  );

export async function execute(interaction) {
  const title = interaction.options.getString("title", true);
  const message = interaction.options.getString("message", true);
  const footer = interaction.options.getString("footer");

  await interaction.reply({
    embeds: [await customEmbed(interaction.guildId, { title, description: message, footer })],
  });
}
