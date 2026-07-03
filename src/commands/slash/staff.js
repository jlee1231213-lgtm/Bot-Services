import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("staff")
  .setDescription("Send a clean staff announcement embed.")
  .addStringOption((option) =>
    option.setName("message").setDescription("Announcement text to post.").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("signed").setDescription("Staff name, rank, or department.").setRequired(false),
  );

export async function execute(interaction) {
  const description = buildMessage(interaction.options.getString("message", true), [
    ["Signed", interaction.options.getString("signed")],
  ]);

  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Staff Announcement", description)] });
}
