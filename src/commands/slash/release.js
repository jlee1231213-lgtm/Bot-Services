import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("release")
  .setDescription("Announce that the session has been released.")
  .addStringOption((option) =>
    option.setName("server_name").setDescription("Name of the server or session.").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("server_code").setDescription("Private server code, invite, or join link.").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("host").setDescription("Host or co-host running the release.").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("notes").setDescription("Extra instructions for the release.").setRequired(false),
  )
.addStringOption(option =>
      option.setName("link")
        .setDescription("Private server link")
        .setRequired(false)).addStringOption(option =>
      option.setName("pt")
        .setDescription("PT status")
        .setRequired(false)
        .addChoices(
          { name: 'Strict', value: 'Strict' },
          { name: 'On', value: 'On' },
          { name: 'Off', value: 'Off' }
        )).addStringOption(option =>
      option.setName("frplimit")
        .setDescription("FRP speed limit")
        .setRequired(false)
        .addChoices(
          { name: '65MPH', value: '65MPH' },
          { name: '75MPH', value: '75MPH' },
          { name: '85MPH', value: '85MPH' }
        ));

export async function execute(interaction) {
  const description = buildMessage("The session has been released. Stay realistic, respect staff calls, and follow all server rules.", [
    ["Server", interaction.options.getString("server_name")],
    ["Code", interaction.options.getString("server_code")],
    ["Host", interaction.options.getString("host")],
    ["Notes", interaction.options.getString("notes")],
  ]);

  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Session Release", description)] });
}
