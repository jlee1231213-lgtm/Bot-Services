import { SlashCommandBuilder } from "discord.js";
import { buildMessage, cleanPing, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("ea")
  .setDescription("Open early access for approved roleplay members.")
  .addStringOption((option) =>
    option.setName("host").setDescription("Host running early access.").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("ping").setDescription("Role or mention to notify, like @here or @EA.").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("notes").setDescription("Extra early access instructions.").setRequired(false),
  );

export async function execute(interaction) {
  const ping = cleanPing(interaction.options.getString("ping"));
  const description = buildMessage("Early access is open for approved members. Prepare your character, join calmly, and wait for staff direction.", [
    ["Host", interaction.options.getString("host")],
    ["Notes", interaction.options.getString("notes")],
  ]);

  await interaction.reply({ content: ping ?? undefined, embeds: [await standardEmbed(interaction.guildId, "Early Access", description)] });
}
