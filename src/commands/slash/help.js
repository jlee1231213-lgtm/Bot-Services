import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Show the Logic Systems command menu.");

export async function execute(interaction) {
  const embed = await standardEmbed(
    interaction.guildId,
    "Command Help",
    "Use these commands to run clean Roblox roleplay sessions and manage your community.",
  );
  embed.addFields(
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
  );

  await interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}
