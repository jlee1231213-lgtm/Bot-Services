import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("settings")
  .setDescription("Show the free custom bot settings panel.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Logic Systems Settings",
        "Use the website dashboard to edit embed title, message, color, footer, and custom bot settings. Staff can also use `/embed`, `/announce`, `/startup`, `/release`, and other fill-in commands directly in Discord.",
      ),
    ],
    ephemeral: true,
  });
}
