import { Client, GatewayIntentBits } from "discord.js";
import { slashCommandMap } from "./commands/slash/index.js";

export function createBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once("ready", () => {
    console.log(`Logic Systems bot online as ${client.user.tag}.`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = slashCommandMap.get(interaction.commandName);
    if (!command) return;

    console.log(`Command received: /${interaction.commandName} in guild ${interaction.guildId}`);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Command failed: /${interaction.commandName}`, error);
      await sendCommandError(interaction);
    }
  });

  return client;
}

async function sendCommandError(interaction) {
  const payload = {
    content: "Something went wrong while running that command. Please try again.",
    ephemeral: true,
  };

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(payload).catch(() => {});
    return;
  }

  await interaction.reply(payload).catch(() => {});
}
