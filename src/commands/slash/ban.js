import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Ban a member with a custom reason embed.")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption((option) => option.setName("user").setDescription("Member to ban").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Ban reason").setRequired(true))
  .addStringOption((option) => option.setName("notes").setDescription("Extra staff notes").setRequired(false))
.addStringOption(option =>
      option.setName('proof')
        .setDescription('Optional proof link')
        .setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason", true);
  const notes = interaction.options.getString("notes");
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member?.bannable) {
    await interaction.reply({ content: "I cannot ban that member. Check my role position and permissions.", ephemeral: true });
    return;
  }

  await member.ban({ reason }).catch(async () => {
    await interaction.reply({ content: "Ban failed. Check my permissions.", ephemeral: true });
  });
  if (interaction.replied) return;

  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Member Banned",
        buildMessage(`${user} has been banned.`, [
          ["Reason", reason],
          ["Moderator", interaction.user],
          ["Notes", notes],
        ]),
      ),
    ],
  });
}
