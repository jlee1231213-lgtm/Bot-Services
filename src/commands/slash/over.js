import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("over")
  .setDescription("Post a customizable session over message.")
  .addStringOption((option) =>
    option.setName("next_session").setDescription("When the next session may happen").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("host").setDescription("Session host").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("notes").setDescription("Extra closing notes").setRequired(false),
  );

export async function execute(interaction) {
  const description = buildMessage("The roleplay session is now over. Thanks for joining the session.", [
    ["Host", interaction.options.getString("host")],
    ["Next Session", interaction.options.getString("next_session")],
    ["Notes", interaction.options.getString("notes")],
  ]);

  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Session Over", description)] });
}
