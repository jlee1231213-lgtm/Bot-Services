import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("reset-over-cooldown")
  .setDescription("Post a session-over cooldown reset notice.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addUserOption((option) => option.setName("user").setDescription("User to reset").setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user") ?? interaction.user;
  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Over Cooldown Reset", `${user}'s session-over cooldown has been reset.`)], ephemeral: true });
}
