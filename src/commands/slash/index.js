import * as announce from "./announce.js";
import * as antiraid from "./antiraid.js";
import * as balance from "./balance.js";
import * as ban from "./ban.js";
import * as cohostEnd from "./cohost-end.js";
import * as cohost from "./cohost.js";
import * as deposit from "./deposit.js";
import * as dmall from "./dmall.js";
import * as ea from "./ea.js";
import * as embed from "./embed.js";
import * as giveMoney from "./give-money.js";
import * as fullmod from "./fullmod.js";
import * as hatepings from "./hatepings.js";
import * as help from "./help.js";
import * as joinVc from "./join-vc.js";
import * as kick from "./kick.js";
import * as lowmod from "./lowmod.js";
import * as membercount from "./membercount.js";
import * as modcall from "./modcall.js";
import * as mute from "./mute.js";
import * as over from "./over.js";
import * as payticket from "./payticket.js";
import * as peacetime from "./peacetime.js";
import * as priority from "./priority.js";
import * as profile from "./profile.js";
import * as quota from "./quota.js";
import * as register from "./register.js";
import * as reinvites from "./reinvites.js";
import * as release from "./release.js";
import * as resetOverCooldown from "./reset-over-cooldown.js";
import * as resetStartupCooldown from "./reset-startup-cooldown.js";
import * as rules from "./rules.js";
import * as say from "./say.js";
import * as scene from "./scene.js";
import * as settings from "./settings.js";
import * as setup from "./setup.js";
import * as staffProfile from "./staff-profile.js";
import * as staff from "./staff.js";
import * as startup from "./startup.js";
import * as status from "./status.js";
import * as supervise from "./supervise.js";
import * as ssd from "./ssd.js";
import * as ssu from "./ssu.js";
import * as ticket from "./ticket.js";
import * as unmute from "./unmute.js";
import * as unregister from "./unregister.js";
import * as vote from "./vote.js";
import * as warn from "./warn.js";
import * as warrant from "./warrant.js";
import * as withdraw from "./withdraw.js";
import * as work from "./work.js";

export const slashCommands = [
  balance,
  ban,
  cohostEnd,
  cohost,
  deposit,
  dmall,
  startup,
  ea,
  giveMoney,
  fullmod,
  hatepings,
  joinVc,
  kick,
  lowmod,
  membercount,
  modcall,
  mute,
  setup,
  release,
  reinvites,
  over,
  payticket,
  profile,
  quota,
  register,
  resetOverCooldown,
  resetStartupCooldown,
  say,
  settings,
  staffProfile,
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
  supervise,
  ssd,
  ticket,
  unmute,
  unregister,
  warn,
  warrant,
  withdraw,
  work,
];

export const slashCommandMap = new Map(slashCommands.map((command) => [command.data.name, command]));
