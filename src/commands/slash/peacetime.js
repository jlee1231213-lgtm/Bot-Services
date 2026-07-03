import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("peacetime")
  .setDescription("Turn peacetime status on or off.")
  .addStringOption((option) =>
    option
      .setName("status")
      .setDescription("Peacetime status to announce.")
      .setRequired(true)
      .addChoices({ name: "On", value: "on" }, { name: "Off", value: "off" }),
  )
  .addStringOption((option) =>
    option.setName("notes").setDescription("Extra peacetime instructions.").setRequired(false),
  );

export async function execute(interaction) {
  const status = interaction.options.getString("status", true);
  const notes = interaction.options.getString("notes");
  const description =
    status === "on"
      ? "Peacetime is now active. No priority scenes, pursuits, or violent roleplay unless staff approves it."
      : "Peacetime is now disabled. Normal roleplay may resume, but all scenes still need to stay realistic.";

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
