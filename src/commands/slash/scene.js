import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("scene")
  .setDescription("Post a scene announcement.")
  .addStringOption((option) =>
    option.setName("location").setDescription("Scene location").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("details").setDescription("Scene details").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("units").setDescription("Units or departments needed").setRequired(false),
  );

export async function execute(interaction) {
  const location = interaction.options.getString("location", true);
  const description = buildMessage("Staff has posted a scene update. Follow directions and keep roleplay clean.", [
    ["Location", location],
    ["Units", interaction.options.getString("units")],
    ["Details", interaction.options.getString("details")],
  ]);

  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, `Scene: ${location}`, description)] });
}
