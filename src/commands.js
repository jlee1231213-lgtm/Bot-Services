import { slashCommands } from "./commands/slash/index.js";

export const commands = slashCommands.map((command) => command.data.toJSON());
