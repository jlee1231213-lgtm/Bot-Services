import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("join-vc")
  .setDescription("Post a voice-channel join reminder.")
  .addChannelOption((option) => option.setName("channel").setDescription("Voice channel").setRequired(false))
  .addStringOption((option) => option.setName("notes").setDescription("Extra VC notes").setRequired(false))
.addStringOption(option =>
      option
        .setName('channel-id')
        .setDescription('The voice channel ID to join.')
        .setRequired(false)
    );

export async function execute(interaction) {
  const channel = interaction.options.getChannel("channel");
  const notes = interaction.options.getString("notes");
  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        "Join Voice Chat",
        `Please join ${channel ?? "the session voice channel"} for staff directions.${notes ? `\n\n**Notes:** ${notes}` : ""}`,
      ),
    ],
  });
}
