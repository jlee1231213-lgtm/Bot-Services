import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { brandColor } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("vote")
  .setDescription("Start a roleplay session vote.")
  .addStringOption((option) =>
    option.setName("question").setDescription("Vote question").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("option_a").setDescription("First option").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("option_b").setDescription("Second option").setRequired(false),
  );

export async function execute(interaction) {
  const question = interaction.options.getString("question") ?? "Start a roleplay session?";
  const optionA = interaction.options.getString("option_a");
  const optionB = interaction.options.getString("option_b");
  const options = optionA || optionB ? `\n\n**Options:**\n${optionA ? `A: ${optionA}` : ""}${optionA && optionB ? "\n" : ""}${optionB ? `B: ${optionB}` : ""}` : "";

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(brandColor)
        .setTitle("Session Vote")
        .setDescription(`${question}${options}`)
        .setFooter({ text: "Use this as a session vote prompt" }),
    ],
  });
}
