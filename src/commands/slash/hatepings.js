import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("hatepings")
  .setDescription("Post a reminder not to spam ping staff.")
  .addStringOption((option) => option.setName("notes").setDescription("Extra ping notes").setRequired(false));

export async function execute(interaction) {
  const notes = interaction.options.getString("notes");
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Ping Reminder",
        `Please avoid spam-pinging staff or session hosts. Wait for official updates.${notes ? `\n\n**Notes:** ${notes}` : ""}`,
      ),
    ],
  });
}
