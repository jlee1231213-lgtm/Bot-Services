import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("warrant")
  .setDescription("Post a roleplay warrant.")
  .addUserOption((option) => option.setName("user").setDescription("Wanted user").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Warrant reason").setRequired(true))
  .addStringOption((option) => option.setName("status").setDescription("Active, cleared, or pending").setRequired(false));

export async function execute(interaction) {
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Roleplay Warrant",
        buildMessage(`${interaction.options.getUser("user", true)} has a warrant notice.`, [
          ["Reason", interaction.options.getString("reason", true)],
          ["Status", interaction.options.getString("status") ?? "Active"],
          ["Officer", interaction.user],
        ]),
      ),
    ],
  });
}
