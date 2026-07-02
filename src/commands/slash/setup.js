import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Show Logic Systems setup steps.");

export async function execute(interaction) {
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Logic Systems Setup",
        "Use `/startup`, `/ea`, `/release`, `/reinvites`, `/over`, `/peacetime`, `/priority`, `/scene`, `/staff`, `/embed`, and `/announce` to run your RP server.",
      ),
    ],
    ephemeral: true,
  });
}
