import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("unmute")
  .setDescription("Remove a member timeout.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((option) => option.setName("user").setDescription("Member to unmute").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Unmute reason").setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided.";
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member?.moderatable) {
    await interaction.reply({ content: "I cannot unmute that member. Check my role position and permissions.", ephemeral: true });
    return;
  }

  await member.timeout(null, reason);
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Member Unmuted",
        buildMessage(`${user} has been unmuted.`, [
          ["Reason", reason],
          ["Moderator", interaction.user],
        ]),
      ),
    ],
  });
}
