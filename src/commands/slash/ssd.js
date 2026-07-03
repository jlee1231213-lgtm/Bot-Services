import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("ssd")
  .setDescription("Announce server shutdown for the current RP session.")
  .addStringOption((option) => option.setName("reason").setDescription("Shutdown reason.").setRequired(false))
  .addStringOption((option) => option.setName("next_session").setDescription("When the next session may happen.").setRequired(false))
  .addStringOption((option) => option.setName("notes").setDescription("Extra shutdown notes.").setRequired(false));

export async function execute(interaction) {
  const description = buildMessage("Server shutdown has been announced. Wrap up scenes and follow staff instructions.", [
    ["Reason", interaction.options.getString("reason")],
    ["Next Session", interaction.options.getString("next_session")],
    ["Notes", interaction.options.getString("notes")],
  ]);

  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Server Shutdown", description)] });
}
