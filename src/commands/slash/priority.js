import { SlashCommandBuilder } from "discord.js";
import { standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("priority")
  .setDescription("Announce priority scene status.")
  .addStringOption((option) =>
    option
      .setName("status")
      .setDescription("Current priority status.")
      .setRequired(true)
      .addChoices(
        { name: "Available", value: "available" },
        { name: "Cooldown", value: "cooldown" },
        { name: "Hold", value: "hold" },
      ),
  )
  .addStringOption((option) =>
    option.setName("notes").setDescription("Extra priority notes").setRequired(false),
  );

export async function execute(interaction) {
  const status = interaction.options.getString("status", true);
  const notes = interaction.options.getString("notes");
  const messages = {
    available: ["Priority Available", "Priority scenes are available. Keep scenes realistic and follow staff directions."],
    cooldown: ["Priority Cooldown", "Priority scenes are on cooldown. No new priority scenes until staff clears it."],
    hold: ["Priority Hold", "All priority scenes are on hold. Continue normal roleplay and avoid major incidents."],
  };
  const [title, description] = messages[status];

  await interaction.reply({
    embeds: [await standardEmbed(interaction.guildId, title, notes ? `${description}\n\n**Notes:** ${notes}` : description)],
  });
}
