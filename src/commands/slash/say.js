import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("say")
  .setDescription("Make the bot say a custom message.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption((option) => option.setName("message").setDescription("Message to send").setRequired(true));

export async function execute(interaction) {
  await interaction.reply({ content: "Message sent.", ephemeral: true });
  await interaction.channel.send(interaction.options.getString("message", true));
}
