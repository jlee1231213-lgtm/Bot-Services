import { SlashCommandBuilder } from "discord.js";
import { cleanPing, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("vote")
  .setDescription("Start a session vote with automatic reactions.")
  .addStringOption((option) =>
    option.setName("question").setDescription("Vote question to ask members.").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("option_a").setDescription("First vote option.").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("option_b").setDescription("Second vote option.").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("ping").setDescription("Role or mention to notify for the vote.").setRequired(false),
  );

export async function execute(interaction) {
  const question = interaction.options.getString("question") ?? "Start a roleplay session?";
  const optionA = interaction.options.getString("option_a");
  const optionB = interaction.options.getString("option_b");
  const ping = cleanPing(interaction.options.getString("ping"));
  const options = optionA || optionB ? `\n\n**Options**\nA - ${optionA ?? "Yes"}\nB - ${optionB ?? "No"}` : "\n\nReact with yes or no below.";

  const message = await interaction.reply({
    content: ping ?? undefined,
    embeds: [await standardEmbed(interaction.guildId, "Vote", `${question}${options}`)],
    fetchReply: true,
  });

  await message.react(optionA || optionB ? "🇦" : "✅").catch(() => {});
  await message.react(optionA || optionB ? "🇧" : "❌").catch(() => {});
}
