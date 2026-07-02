import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const dataPath = path.join(dataDir, "premium-guilds.json");

async function readStore() {
  try {
    const data = await readFile(dataPath, "utf8");
    return JSON.parse(data);
  } catch {
    return { guilds: {} };
  }
}

async function writeStore(store) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataPath, JSON.stringify(store, null, 2));
}

export async function setPremiumGuild(guildId, details = {}) {
  if (!guildId) return;

  const store = await readStore();
  store.guilds[guildId] = {
    active: true,
    updatedAt: new Date().toISOString(),
    ...details,
  };
  await writeStore(store);
}

export async function removePremiumGuild(guildId, details = {}) {
  if (!guildId) return;

  const store = await readStore();
  store.guilds[guildId] = {
    active: false,
    updatedAt: new Date().toISOString(),
    ...details,
  };
  await writeStore(store);
}

export async function isPremiumGuild(guildId) {
  const store = await readStore();
  return Boolean(store.guilds[guildId]?.active);
}

export async function setGuildSettings(guildId, settings = {}) {
  if (!guildId) return;

  const store = await readStore();
  store.settings ??= {};
  store.settings[guildId] = {
    ...(store.settings[guildId] ?? {}),
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(store);
}

export async function getGuildSettings(guildId) {
  const store = await readStore();
  return store.settings?.[guildId] ?? null;
}

export async function createBotRequest(details = {}) {
  const store = await readStore();
  store.botRequests ??= [];
  const request = {
    id: cryptoRandomId(),
    status: "new",
    createdAt: new Date().toISOString(),
    ...details,
  };
  store.botRequests.unshift(request);
  await writeStore(store);
  return request;
}

export async function getBotRequests() {
  const store = await readStore();
  return store.botRequests ?? [];
}

export async function createSession(sessionId, session) {
  const store = await readStore();
  store.sessions ??= {};
  store.sessions[sessionId] = {
    ...session,
    createdAt: new Date().toISOString(),
  };
  await writeStore(store);
}

export async function getSession(sessionId) {
  const store = await readStore();
  return store.sessions?.[sessionId] ?? null;
}

export async function deleteSession(sessionId) {
  const store = await readStore();
  if (store.sessions?.[sessionId]) {
    delete store.sessions[sessionId];
    await writeStore(store);
  }
}

function cryptoRandomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
