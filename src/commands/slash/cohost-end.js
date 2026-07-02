import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("cohost-end")
  .setDescription("End a cohost session.")
  .addUserOption((option) => option.setName("user").setDescription("Cohost user").setRequired(false))
  .addStringOption((option) => option.setName("notes").setDescription("Closing notes").setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser("user");
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Cohost Ended",
        buildMessage(user ? `${user}'s cohost session has ended.` : "The cohost session has ended.", [
          ["Notes", interaction.options.getString("notes")],
        ]),
      ),
    ],
  });
}
