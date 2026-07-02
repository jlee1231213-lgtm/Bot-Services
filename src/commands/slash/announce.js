import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getGuildSettings } from "../../store.js";
import { brandColor, parseHexColor } from "./_shared.js";

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
  const settings = await getGuildSettings(interaction.guildId);
  const title = interaction.options.getString("title", true);
  const message = interaction.options.getString("message", true);
  const footer = interaction.options.getString("footer") ?? settings?.footerText ?? "Logic Systems Free";

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(parseHexColor(settings?.embedColor) ?? brandColor)
        .setTitle(title)
        .setDescription(message)
        .setFooter({ text: footer }),
    ],
  });
}
