import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("work")
  .setDescription("Post a custom roleplay work shift receipt.")
  .addStringOption((option) => option.setName("job").setDescription("Job or shift name").setRequired(true))
  .addNumberOption((option) => option.setName("pay").setDescription("Pay earned").setRequired(false))
  .addStringOption((option) => option.setName("notes").setDescription("Shift notes").setRequired(false));

export async function execute(interaction) {
  const pay = interaction.options.getNumber("pay");
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Work Shift",
        buildMessage(`${interaction.user} completed a roleplay shift.`, [
          ["Job", interaction.options.getString("job", true)],
          ["Pay", pay ? `$${pay.toLocaleString()}` : null],
          ["Notes", interaction.options.getString("notes")],
        ]),
      ),
    ],
  });
}
