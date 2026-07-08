import { SlashCommandBuilder } from "discord.js";
import { buildMessage, cleanPing, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("startup")
  .setDescription("Announce that a roleplay session is starting.")
  .addStringOption((option) =>
    option.setName("server_name").setDescription("Name of the server or session.").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("server_code").setDescription("Private server code, invite, or join link.").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("host").setDescription("Host or co-host running the session.").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("ping").setDescription("Role or mention to notify, like @here or @Sessions.").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("notes").setDescription("Extra instructions for members joining.").setRequired(false),
  );

export async function execute(interaction) {
  const ping = cleanPing(interaction.options.getString("ping"));
  const description = buildMessage("A session startup has been posted. Join quickly, listen to staff, and keep the roleplay realistic.", [
    ["Server", interaction.options.getString("server_name")],
    ["Code", interaction.options.getString("server_code")],
    ["Host", interaction.options.getString("host")],
    ["Notes", interaction.options.getString("notes")],
  ]);

  await interaction.reply({ content: ping ?? undefined, embeds: [await standardEmbed(interaction.guildId, "Session Startup", description)] });
}
