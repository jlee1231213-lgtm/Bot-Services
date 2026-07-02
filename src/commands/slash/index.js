import * as announce from "./announce.js";
import * as antiraid from "./antiraid.js";
import * as ea from "./ea.js";
import * as embed from "./embed.js";
import * as help from "./help.js";
import * as over from "./over.js";
import * as peacetime from "./peacetime.js";
import * as priority from "./priority.js";
import * as reinvites from "./reinvites.js";
import * as release from "./release.js";
import * as rules from "./rules.js";
import * as scene from "./scene.js";
import * as setup from "./setup.js";
import * as staff from "./staff.js";
import * as startup from "./startup.js";
import * as status from "./status.js";
import * as ssu from "./ssu.js";
import * as vote from "./vote.js";

export const slashCommands = [
  startup,
  ea,
  setup,
  release,
  reinvites,
  over,
  help,
  status,
  rules,
  peacetime,
  ssu,
  vote,
  priority,
  scene,
  staff,
  embed,
  antiraid,
  announce,
];

export const slashCommandMap = new Map(slashCommands.map((command) => [command.data.name, command]));
