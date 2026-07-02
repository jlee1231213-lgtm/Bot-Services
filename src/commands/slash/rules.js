import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("rules")
  .setDescription("Post a clean roleplay rules reminder.")
  .addStringOption((option) =>
    option.setName("notes").setDescription("Extra rule notes").setRequired(false),
  );

export async function execute(interaction) {
  const notes = interaction.options.getString("notes");
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Roleplay Rules",
        `Follow staff instructions, stay in character, avoid fail roleplay, and keep every scene fair for everyone.${notes ? `\n\n**Notes:** ${notes}` : ""}`,
      ),
    ],
  });
}
