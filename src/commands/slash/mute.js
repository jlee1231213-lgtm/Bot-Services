import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("mute")
  .setDescription("Timeout a member with a custom reason.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((option) => option.setName("user").setDescription("Member to mute").setRequired(true))
  .addIntegerOption((option) =>
    option.setName("minutes").setDescription("Mute duration in minutes").setRequired(true).setMinValue(1).setMaxValue(40320),
  )
  .addStringOption((option) => option.setName("reason").setDescription("Mute reason").setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user", true);
  const minutes = interaction.options.getInteger("minutes", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided.";
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member?.moderatable) {
    await interaction.reply({ content: "I cannot mute that member. Check my role position and permissions.", ephemeral: true });
    return;
  }

  await member.timeout(minutes * 60 * 1000, reason);
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Member Muted",
        buildMessage(`${user} has been muted.`, [
          ["Duration", `${minutes} minute${minutes === 1 ? "" : "s"}`],
          ["Reason", reason],
          ["Moderator", interaction.user],
        ]),
      ),
    ],
  });
}
