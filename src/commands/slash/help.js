import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { brandColor } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Show Logic Systems free commands and service info.");

export async function execute(interaction) {
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(brandColor)
        .setTitle("Logic Systems Service")
        .setDescription("Free custom bot commands: `/startup`, `/ea`, `/release`, `/reinvites`, `/over`, `/peacetime`, `/priority`, `/scene`, `/staff`, `/vote`, `/embed`, `/announce`, `/antiraid`, `/status`, `/setup`.\nMost RP commands include fill-in options so staff can customize the post before sending.")
        .setFooter({ text: "Free custom bots for Roblox roleplay" }),
    ],
    ephemeral: true,
  });
}
