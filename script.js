const BOT_CLIENT_ID = "1507551249204117535";
const STORAGE_KEY = "logic-systems-dashboard";
const SESSION_STORAGE_KEY = "logic-systems-session";
const BACKEND_URL = "https://bot-services-uvwb.onrender.com";

const inviteUrl =
  BOT_CLIENT_ID === "YOUR_BOT_CLIENT_ID"
    ? "#"
    : `https://discord.com/oauth2/authorize?client_id=${BOT_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

document.querySelectorAll("#inviteButton, #inviteButtonHero, #inviteButtonBottom").forEach((button) => {
  button.href = inviteUrl;
  if (inviteUrl === "#") {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      alert("Add your Discord bot client ID in script.js first.");
    });
  }
});

const commandTemplateDefaults = {
  startup: {
    label: "/startup",
    title: "Session Startup",
    message: "A new roleplay session is starting. Join up, follow staff directions, and keep scenes realistic.",
    color: "#5865f2",
    footer: "Powered by Logic Systems",
    pingRole: "",
    channel: "",
    cooldown: "10",
    enabled: true,
  },
  release: {
    label: "/release",
    title: "Session Release",
    message: "The roleplay session has been released. Check the details below and join when ready.",
    color: "#23c46e",
    footer: "Powered by Logic Systems",
    pingRole: "",
    channel: "",
    cooldown: "0",
    enabled: true,
  },
  reinvites: {
    label: "/reinvites",
    title: "Reinvites Open",
    message: "Reinvites are open for this session. Use the details below to return to roleplay.",
    color: "#64d8ff",
    footer: "Powered by Logic Systems",
    pingRole: "",
    channel: "",
    cooldown: "5",
    enabled: true,
  },
  ea: {
    label: "/ea",
    title: "Early Access",
    message: "Early access is now open. Staff may use this post for limited session entry.",
    color: "#f2c94c",
    footer: "Powered by Logic Systems",
    pingRole: "",
    channel: "",
    cooldown: "0",
    enabled: true,
  },
  over: {
    label: "/over",
    title: "Session Over",
    message: "The roleplay session is now over. Thank you for joining.",
    color: "#ff6b6b",
    footer: "Powered by Logic Systems",
    pingRole: "",
    channel: "",
    cooldown: "0",
    enabled: true,
  },
  peacetime: {
    label: "/peacetime",
    title: "Peacetime Status",
    message: "Peacetime status has been updated for the server.",
    color: "#9b8cff",
    footer: "Powered by Logic Systems",
    pingRole: "",
    channel: "",
    cooldown: "0",
    enabled: true,
  },
  priority: {
    label: "/priority",
    title: "Priority Status",
    message: "Priority status has been updated. Follow staff directions before starting scenes.",
    color: "#ff9f43",
    footer: "Powered by Logic Systems",
    pingRole: "",
    channel: "",
    cooldown: "0",
    enabled: true,
  },
  scene: {
    label: "/scene",
    title: "Scene Update",
    message: "A new scene update has been posted. Use the details below for location and instructions.",
    color: "#76f0d2",
    footer: "Powered by Logic Systems",
    pingRole: "",
    channel: "",
    cooldown: "0",
    enabled: true,
  },
  staff: {
    label: "/staff",
    title: "Staff Announcement",
    message: "Staff have posted a new announcement for the server.",
    color: "#5865f2",
    footer: "Powered by Logic Systems",
    pingRole: "",
    channel: "",
    cooldown: "0",
    enabled: true,
  },
  ticket: {
    label: "/ticket",
    title: "Support Ticket",
    message: "A support ticket panel is ready. Use this for staff help and service requests.",
    color: "#64d8ff",
    footer: "Powered by Logic Systems",
    pingRole: "",
    channel: "",
    cooldown: "0",
    enabled: true,
  },
};

const defaults = {
  main: {
    serverName: "Logic RP",
    plan: "premium",
    botName: "Logic Systems",
    guildId: "",
    prefix: "/",
    embedTitle: "Session Startup",
    embedMessage: "A new roleplay session is starting. Join up, follow staff directions, and keep scenes realistic.",
    embedColor: "#3c43ec",
    footerText: "Powered by Logic Systems",
    customEmbeds: true,
    embedBuilder: true,
    antiRaid: true,
    commandTemplates: structuredClone(commandTemplateDefaults),
  },
  premium: {
    serverName: "Custom Demo",
    plan: "premium",
    botName: "Logic Custom",
    guildId: "",
    prefix: "/",
    embedTitle: "Custom Session",
    embedMessage: "Your custom Logic Systems service embed is ready for startup, release, reinvites, or staff announcements.",
    embedColor: "#76f0d2",
    footerText: "Logic Systems Custom",
    customEmbeds: true,
    embedBuilder: true,
    antiRaid: true,
    commandTemplates: structuredClone(commandTemplateDefaults),
  },
};

let selectedServer = "main";
let selectedCommand = "startup";
let state = loadState();
let sessionToken = loadSessionToken();

const form = document.querySelector("#dashboardForm");
const selectedServerName = document.querySelector("#selectedServerName");
const mainPlanLabel = document.querySelector("#mainPlanLabel");
const planNotice = document.querySelector("#planNotice");
const previewColor = document.querySelector("#previewColor");
const previewTitle = document.querySelector("#previewTitle");
const previewMessage = document.querySelector("#previewMessage");
const previewFooter = document.querySelector("#previewFooter");
const dashboardStatus = document.querySelector("#dashboardStatus");
const commandTemplateList = document.querySelector("#commandTemplateList");
const botRequestForm = document.querySelector("#botRequestForm");
const requestStatus = document.querySelector("#requestStatus");
let loggedInGuilds = [];

function loadState() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return structuredClone(defaults);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadSessionToken() {
  const hash = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  const session = hash.get("session");
  if (session) {
    localStorage.setItem(SESSION_STORAGE_KEY, session);
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}#dashboard`);
    return session;
  }
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

function currentBot() {
  ensureCommandTemplates(state[selectedServer]);
  return state[selectedServer];
}

function ensureCommandTemplates(bot) {
  bot.commandTemplates = {
    ...structuredClone(commandTemplateDefaults),
    ...(bot.commandTemplates ?? {}),
  };
  Object.keys(commandTemplateDefaults).forEach((key) => {
    bot.commandTemplates[key] = {
      ...commandTemplateDefaults[key],
      ...(bot.commandTemplates[key] ?? {}),
    };
  });
}

function setServer(serverId) {
  selectedServer = serverId;
  document.querySelectorAll(".server-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.server === selectedServer);
  });
  renderDashboard();
}

function setPlan(plan) {
  currentBot().plan = plan;
  if (plan === "free") {
    currentBot().footerText = "Powered by Logic Systems";
    currentBot().customEmbeds = true;
    currentBot().embedBuilder = true;
    currentBot().antiRaid = true;
  } else {
    currentBot().customEmbeds = true;
    currentBot().embedBuilder = true;
    currentBot().antiRaid = true;
  }
  saveState();
  renderDashboard();
}

function renderDashboard() {
  const bot = currentBot();
  const isPremium = bot.plan === "premium";

  selectedServerName.textContent = bot.serverName;
  mainPlanLabel.textContent = state.main.plan === "premium" ? "Free custom tools" : "Free service";

  form.elements.botName.value = bot.botName;
  form.elements.guildId.value = bot.guildId;
  form.elements.prefix.value = bot.prefix;
  form.elements.embedTitle.value = bot.embedTitle;
  form.elements.embedMessage.value = bot.embedMessage;
  form.elements.embedColor.value = bot.embedColor;
  form.elements.footerText.value = bot.footerText;
  form.elements.customEmbeds.checked = bot.customEmbeds;
  form.elements.embedBuilder.checked = bot.embedBuilder;
  form.elements.antiRaid.checked = bot.antiRaid;
  renderCommandTemplateList();
  renderCommandTemplateFields();

  document.querySelectorAll("[data-plan]").forEach((button) => {
    button.classList.toggle("active", button.dataset.plan === bot.plan);
  });

  form.elements.embedTitle.disabled = false;
  form.elements.embedMessage.disabled = false;
  form.elements.embedColor.disabled = false;
  form.elements.footerText.disabled = false;
  form.elements.customEmbeds.disabled = false;
  form.elements.embedBuilder.disabled = false;
  form.elements.antiRaid.disabled = false;

  document.querySelectorAll(".toggle-row").forEach((row) => {
    row.classList.remove("locked");
  });

  planNotice.textContent = isPremium
    ? "Free custom tools are active: branded embeds, in-bot embed building, footer editing, and anti-raid status are unlocked."
    : "Free service is active: roleplay commands, custom embeds, dashboard controls, and staff tools are available.";

  updatePreview();
}

function updatePreview() {
  const bot = currentBot();
  const template = bot.commandTemplates[selectedCommand];
  const color = template?.color || form.elements.embedColor.value;
  const title = template?.title || form.elements.embedTitle.value;
  const message = template?.message || form.elements.embedMessage.value;
  const footer = template?.footer || form.elements.footerText.value;

  previewColor.style.background = color;
  previewTitle.textContent = title || "Untitled Embed";
  previewMessage.textContent = message || "Embed message preview";
  previewFooter.textContent = footer || "No footer";
}

function collectForm() {
  const bot = currentBot();
  bot.botName = form.elements.botName.value.trim() || bot.serverName;
  bot.guildId = form.elements.guildId.value.trim();
  bot.prefix = form.elements.prefix.value.trim() || "/";

  bot.embedTitle = form.elements.embedTitle.value.trim() || "Untitled Embed";
  bot.embedMessage = form.elements.embedMessage.value.trim() || "Embed message preview";
  bot.embedColor = form.elements.embedColor.value;
  bot.footerText = form.elements.footerText.value.trim() || "Powered by Logic Systems";
  bot.customEmbeds = form.elements.customEmbeds.checked;
  bot.embedBuilder = form.elements.embedBuilder.checked;
  bot.antiRaid = form.elements.antiRaid.checked;
  collectCommandTemplate();
}

function renderCommandTemplateList() {
  if (!commandTemplateList) return;
  commandTemplateList.innerHTML = "";
  Object.entries(commandTemplateDefaults).forEach(([key, template]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "command-template-tab";
    button.dataset.commandTemplate = key;
    button.classList.toggle("active", key === selectedCommand);
    button.innerHTML = `<span>${template.label}</span><small>${currentBot().commandTemplates[key]?.enabled === false ? "Off" : "Editable"}</small>`;
    button.addEventListener("click", () => {
      collectCommandTemplate();
      selectedCommand = key;
      renderCommandTemplateList();
      renderCommandTemplateFields();
      updatePreview();
    });
    commandTemplateList.append(button);
  });
}

function renderCommandTemplateFields() {
  const template = currentBot().commandTemplates[selectedCommand];
  if (!template || !form.elements.commandTitle) return;
  form.elements.commandTitle.value = template.title;
  form.elements.commandMessage.value = template.message;
  form.elements.commandColor.value = template.color;
  form.elements.commandFooter.value = template.footer;
  form.elements.commandPingRole.value = template.pingRole;
  form.elements.commandChannel.value = template.channel;
  form.elements.commandCooldown.value = template.cooldown;
  form.elements.commandEnabled.checked = template.enabled !== false;
}

function collectCommandTemplate() {
  if (!form.elements.commandTitle) return;
  const bot = currentBot();
  const template = bot.commandTemplates[selectedCommand];
  template.title = form.elements.commandTitle.value.trim() || commandTemplateDefaults[selectedCommand].title;
  template.message = form.elements.commandMessage.value.trim() || commandTemplateDefaults[selectedCommand].message;
  template.color = form.elements.commandColor.value;
  template.footer = form.elements.commandFooter.value.trim() || "Powered by Logic Systems";
  template.pingRole = form.elements.commandPingRole.value.trim();
  template.channel = form.elements.commandChannel.value.trim();
  template.cooldown = form.elements.commandCooldown.value.trim() || "0";
  template.enabled = form.elements.commandEnabled.checked;
}

document.querySelectorAll(".server-card").forEach((card) => {
  card.addEventListener("click", () => setServer(card.dataset.server));
});

document.querySelectorAll("[data-plan]").forEach((button) => {
  button.addEventListener("click", () => setPlan(button.dataset.plan));
});

document.querySelectorAll("[data-plan-jump]").forEach((button) => {
  button.href = "#dashboard";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    setPlan("premium");
    document.querySelector("#dashboard").scrollIntoView({ behavior: "smooth" });
  });
});

const upgradeButton = document.querySelector("#upgradeButton");
if (upgradeButton) {
  upgradeButton.href = "#free";
  upgradeButton.addEventListener("click", (event) => {
    event.preventDefault();
    setPlan("premium");
    document.querySelector("#dashboard").scrollIntoView({ behavior: "smooth" });
  });
}

function openPremiumCheckout() {
  setPlan("premium");
  document.querySelector("#dashboard").scrollIntoView({ behavior: "smooth" });
}

form.addEventListener("input", () => {
  collectForm();
  saveState();
  updatePreview();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  collectForm();
  saveState();
  saveDashboardSettings();
});

if (botRequestForm) {
  botRequestForm.addEventListener("submit", submitBotRequest);
}

renderDashboard();
initDiscordDashboard();

async function submitBotRequest(event) {
  event.preventDefault();
  const formData = new FormData(botRequestForm);
  const request = Object.fromEntries(formData.entries());

  if (BACKEND_URL === "YOUR_BACKEND_URL") {
    setRequestStatus("Request saved in this browser. Add the backend URL to send it to staff.");
    localStorage.setItem("logic-systems-last-request", JSON.stringify({ ...request, createdAt: new Date().toISOString() }));
    botRequestForm.reset();
    return;
  }

  try {
    setRequestStatus("Sending request...");
    const result = await apiPost("/api/bot-requests", request);
    setRequestStatus(`Request sent. Your request ID is ${result.request.id}.`);
    botRequestForm.reset();
  } catch (error) {
    setRequestStatus(error.message || "Could not send request. Try again in a minute.");
  }
}

function setRequestStatus(message) {
  if (requestStatus) requestStatus.textContent = message;
}

async function initDiscordDashboard() {
  const dashboardHead = document.querySelector(".dashboard-head");
  const loginButton = document.createElement("button");
  loginButton.className = "btn secondary discord-login";
  loginButton.type = "button";
  loginButton.textContent = "Sign in with Discord";
  loginButton.addEventListener("click", () => {
    if (BACKEND_URL === "YOUR_BACKEND_URL") {
      alert("Add your hosted backend URL in script.js first.");
      return;
    }
    const returnTo = encodeURIComponent(window.location.origin);
    window.location.href = `${BACKEND_URL}/auth/discord?returnTo=${returnTo}`;
  });
  dashboardHead.append(loginButton);

  if (BACKEND_URL === "YOUR_BACKEND_URL") return;
  if (!sessionToken) {
    setDashboardStatus("Sign in with Discord to load your servers and service settings.");
    return;
  }

  try {
    setDashboardStatus("Loading your Discord servers...");
    const me = await apiGet("/api/me");
    loginButton.textContent = `Signed in: ${me.user.globalName || me.user.username}`;

    const { guilds } = await apiGet("/api/guilds");
    loggedInGuilds = guilds;
    renderLoggedInGuilds(guilds);
    setDashboardStatus(guilds.length ? "Select a Discord server to edit its Logic Systems service." : "No manageable Discord servers found for this Discord account.");
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionToken = null;
    setDashboardStatus("Discord sign-in expired. Sign in again to load your servers.");
    loginButton.textContent = "Sign in with Discord";
  }
}

function setDashboardStatus(message) {
  if (dashboardStatus) dashboardStatus.textContent = message;
}

function renderLoggedInGuilds(guilds) {
  const panel = document.querySelector(".server-panel");
  panel.querySelectorAll(".server-card[data-discord-guild]").forEach((card) => card.remove());
  panel.querySelectorAll(".server-empty").forEach((message) => message.remove());

  if (guilds.length === 0) {
    const message = document.createElement("p");
    message.className = "server-empty";
    message.textContent = "No manageable Discord servers found.";
    panel.append(message);
    return;
  }

  guilds.forEach((guild) => {
    const card = document.createElement("button");
    card.className = "server-card";
    card.type = "button";
    card.dataset.server = guild.id;
    card.dataset.discordGuild = "true";
    card.innerHTML = `<span>${guild.name}</span><small>Free service</small>`;
    card.addEventListener("click", async () => {
      selectedServer = guild.id;
      document.querySelectorAll(".server-card").forEach((item) => item.classList.toggle("active", item === card));
      await loadGuildSettings(guild);
    });
    panel.append(card);
  });
}

async function loadGuildSettings(guild) {
  const { premium, settings } = await apiGet(`/api/guilds/${guild.id}/settings`);
  state[guild.id] = {
    serverName: guild.name,
    plan: premium ? "premium" : "premium",
    botName: guild.name,
    guildId: guild.id,
    prefix: "/",
    embedTitle: settings.embedTitle,
    embedMessage: settings.embedMessage,
    embedColor: settings.embedColor,
    footerText: settings.footerText,
    customEmbeds: Boolean(settings.customEmbeds),
    embedBuilder: true,
    antiRaid: true,
    commandTemplates: settings.commandTemplates ?? structuredClone(commandTemplateDefaults),
  };
  ensureCommandTemplates(state[guild.id]);
  saveState();
  renderDashboard();
}

async function saveDashboardSettings() {
  const bot = currentBot();
  if (BACKEND_URL === "YOUR_BACKEND_URL" || !loggedInGuilds.some((guild) => guild.id === bot.guildId)) {
    alert("Dashboard settings saved in this browser. Sign in with Discord to save them to the bot.");
    saveState();
    return;
  }

  try {
    const result = await apiPut(`/api/guilds/${bot.guildId}/settings`, {
      embedTitle: bot.embedTitle,
      embedMessage: bot.embedMessage,
      embedColor: bot.embedColor,
      footerText: bot.footerText,
      customEmbeds: bot.customEmbeds,
      commandTemplates: bot.commandTemplates,
    });
    Object.assign(bot, result.settings);
    saveState();
    updatePreview();
    alert("Embed settings saved to the bot.");
  } catch (error) {
    alert(error.message || "Could not save settings.");
  }
}

async function apiGet(path) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return parseApiResponse(response);
}

async function apiPut(path, body) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  return parseApiResponse(response);
}

async function apiPost(path, body) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  return parseApiResponse(response);
}

function getAuthHeaders() {
  return sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {};
}

async function parseApiResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}
