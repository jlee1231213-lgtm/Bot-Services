import { SlashCommandBuilder } from "discord.js";
import { buildMessage, standardEmbed } from "./_shared.js";

export const data = new SlashCommandBuilder()
  .setName("startup")
  .setDescription("Post a customizable roleplay startup message.")
  .addStringOption((option) =>
    option.setName("server_name").setDescription("Roleplay server name").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("server_code").setDescription("Join code or link").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("host").setDescription("Session host").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("ping").setDescription("Ping text, like @here or @Sessions").setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("notes").setDescription("Extra startup notes").setRequired(false),
  );

export async function execute(interaction) {
  const description = buildMessage("A new roleplay session is starting. Join up, follow staff directions, and keep scenes realistic.", [
    ["Server", interaction.options.getString("server_name")],
    ["Code", interaction.options.getString("server_code")],
    ["Host", interaction.options.getString("host")],
    ["Ping", interaction.options.getString("ping")],
    ["Notes", interaction.options.getString("notes")],
  ]);

  await interaction.reply({ embeds: [await standardEmbed(interaction.guildId, "Session Startup", description)] });
}
