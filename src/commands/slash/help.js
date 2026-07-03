import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { brandColor } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Show the Logic Systems command menu.");

export async function execute(interaction) {
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(brandColor)
        .setTitle("Logic Systems Commands")
        .setDescription("Use these commands to run clean Roblox roleplay sessions and manage your community.")
        .addFields(
          {
            name: "Session",
            value: "`/startup` `/ea` `/release` `/reinvites` `/over` `/vote`",
            inline: false,
          },
          {
            name: "Roleplay Control",
            value: "`/peacetime` `/priority` `/scene` `/ssu` `/ssd` `/modcall` `/lowmod` `/fullmod` `/cohost` `/cohost-end`",
            inline: false,
          },
          {
            name: "Staff Tools",
            value: "`/staff` `/announce` `/embed` `/ticket` `/antiraid` `/status` `/setup`",
            inline: false,
          },
          {
            name: "Moderation",
            value: "`/warn` `/mute` `/unmute` `/kick` `/ban` `/hatepings` `/dmall`",
            inline: false,
          },
        )
        .setFooter({ text: "Powered by Logic Systems" })
        .setTimestamp(),
    ],
    ephemeral: true,
  });
}
