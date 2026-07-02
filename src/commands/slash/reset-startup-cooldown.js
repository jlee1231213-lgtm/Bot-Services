import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("reset-startup-cooldown")
  .setDescription("Post a startup cooldown reset notice.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addUserOption((option) => option.setName("user").setDescription("User to reset").setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user") ?? interaction.user;
  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Startup Cooldown Reset", `${user}'s startup cooldown has been reset.`)], ephemeral: true });
}
