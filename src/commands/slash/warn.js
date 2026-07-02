import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("Post a custom warning for a member.")
  .addUserOption((option) => option.setName("user").setDescription("Member to warn").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Warning reason").setRequired(true))
  .addStringOption((option) => option.setName("action").setDescription("Next action if behavior continues").setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user", true);
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Member Warning",
        buildMessage(`${user} has been warned.`, [
          ["Reason", interaction.options.getString("reason", true)],
          ["Next Action", interaction.options.getString("action")],
          ["Moderator", interaction.user],
        ]),
      ),
    ],
  });
}
