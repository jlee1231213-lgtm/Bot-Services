import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("ea")
  .setDescription("Post a customizable early access roleplay message.")
  .addStringOption((option) =>
    option.setName("host").setDescription("Early access host").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("ping").setDescription("Ping text, like @here or @EA").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("notes").setDescription("Extra early access notes").setRequired(false),
  );

export async function execute(interaction) {
  const description = buildMessage("Early access is now open for approved members. Prepare your characters and wait for staff direction.", [
    ["Host", interaction.options.getString("host")],
    ["Ping", interaction.options.getString("ping")],
    ["Notes", interaction.options.getString("notes")],
  ]);

  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Early Access", description)] });
}
