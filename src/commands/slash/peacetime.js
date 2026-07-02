import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("peacetime")
  .setDescription("Announce peacetime status.")
  .addStringOption((option) =>
    option
      .setName("status")
      .setDescription("Whether peacetime is on or off.")
      .setRequired(true)
      .addChoices({ name: "On", value: "on" }, { name: "Off", value: "off" }),
  )
  .addStringOption((option) =>
    option.setName("notes").setDescription("Extra peacetime notes").setRequired(false),
  );

export async function execute(interaction) {
  const status = interaction.options.getString("status", true);
  const notes = interaction.options.getString("notes");
  const description =
    status === "on"
      ? "Peacetime is now active. No priority scenes, pursuits, or violent roleplay unless staff approves."
      : "Peacetime is now disabled. Normal roleplay may resume.";

  await interaction.reply({
    embeds: [
      await standardEmbed(
        interaction.guildId,
        `Peacetime ${status === "on" ? "Enabled" : "Disabled"}`,
        notes ? `${description}\n\n**Notes:** ${notes}` : description,
      ),
    ],
  });
}
