import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kick a member with a custom reason embed.")
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption((option) => option.setName("user").setDescription("Member to kick").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Kick reason").setRequired(true))
  .addStringOption((option) => option.setName("notes").setDescription("Extra staff notes").setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason", true);
  const notes = interaction.options.getString("notes");
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member?.kickable) {
    await interaction.reply({ content: "I cannot kick that member. Check my role position and permissions.", ephemeral: true });
    return;
  }

  await member.kick(reason).catch(async () => {
    await interaction.reply({ content: "Kick failed. Check my permissions.", ephemeral: true });
  });
  if (interaction.replied) return;

  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Member Kicked",
        buildMessage(`${user} has been kicked.`, [
          ["Reason", reason],
          ["Moderator", interaction.user],
          ["Notes", notes],
        ]),
      ),
    ],
  });
}
