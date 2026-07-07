const BOT_CLIENT_ID = "1507551249204117535";
const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${BOT_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;
const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://bot-services-uvwb.onrender.com";

const previewTitle = document.querySelector("#previewTitle");
const previewMessage = document.querySelector("#previewMessage");
const previewFooter = document.querySelector("#previewFooter");
const previewColor = document.querySelector("#previewColor");
const supportCodeText = document.querySelector("#supportCodeText");
const dashboardStatus = document.querySelector("#dashboardStatus");
const selectedServerName = document.querySelector("#selectedServerName");
const commandTemplateList = document.querySelector("#commandTemplateList");
const serverListContainer = document.querySelector("#serverList");
const requestForm = document.querySelector("#botRequestForm");
const requestStatus = document.querySelector("#requestStatus");
const dashboardForm = document.querySelector("#dashboardForm");
const ownerOpenButton = document.querySelector("#ownerOpenButton");
const ownerSaveButton = document.querySelector("#ownerSaveButton");
const ownerSupportStatus = document.querySelector("#ownerSupportStatus");
const planNotice = document.querySelector("#planNotice");
const dashboardSignInButton = document.querySelector("#dashboardSignInButton");
const inviteTargets = [
  document.querySelector("#inviteButton"),
  document.querySelector("#inviteButtonHero"),
  document.querySelector("#inviteButtonBottom"),
];

const titleInput = document.querySelector("#embedTitleInput");
const messageInput = document.querySelector("#embedMessageInput");
const colorInput = document.querySelector("#embedColorInput");
const footerInput = document.querySelector("#footerTextInput");

const commandCatalog = [
  { key: "startup", name: "STARTUP", desc: "Launch a session announcement." },
  { key: "release", name: "RELEASE", desc: "Open the session publicly." },
  { key: "reinvites", name: "REINVITES", desc: "Handle reinvite waves cleanly." },
  { key: "priority", name: "PRIORITY", desc: "Set priority availability." },
  { key: "staff", name: "STAFF", desc: "Post staff-focused notices." },
  { key: "ssd", name: "SHUTDOWN", desc: "Wrap sessions up clearly." },
];

let user = null;
let guilds = [];
let selectedGuildId = null;
let guildSettings = null;
let activeCommandKey = "startup";
let sessionToken = null;

function setText(el, text) {
  if (el) el.textContent = text;
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value ?? {}));
}

function setInviteLinks() {
  inviteTargets.forEach((link) => {
    if (link) link.href = BOT_INVITE_URL;
  });
}

function getSessionStorageKey() {
  return "logicSystemsSession";
}

function saveSessionToken(token) {
  sessionToken = token || null;
  if (sessionToken) {
    window.localStorage.setItem(getSessionStorageKey(), sessionToken);
  } else {
    window.localStorage.removeItem(getSessionStorageKey());
  }
}

function loadStoredSessionToken() {
  const stored = window.localStorage.getItem(getSessionStorageKey());
  sessionToken = stored || null;
}

function consumeSessionFromHash() {
  const rawHash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  if (!rawHash) return;

  const candidates = [rawHash];

  // Legacy redirect support: "#https://site/#dashboard?session=..."
  const nestedHashIndex = rawHash.lastIndexOf("#");
  if (nestedHashIndex > -1 && nestedHashIndex < rawHash.length - 1) {
    candidates.push(rawHash.slice(nestedHashIndex + 1));
  }

  for (const candidate of candidates) {
    const [hashPath = "", hashQuery = ""] = candidate.split("?");
    const params = new URLSearchParams(hashQuery);
    const token = params.get("session");

    if (!token) continue;

    saveSessionToken(token);
    params.delete("session");

    const cleanHash = params.toString()
      ? `${hashPath}?${params.toString()}`
      : hashPath;

    const cleanUrl = `${window.location.pathname}${window.location.search}${cleanHash ? `#${cleanHash}` : ""}`;
    window.history.replaceState({}, document.title, cleanUrl);
    return;
  }
}

function getAuthHeaders() {
  return sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {};
}

function setAuthLinks() {
  if (!dashboardSignInButton) return;

  const returnTo = `${window.location.origin}${window.location.pathname}${window.location.search}#dashboard`;
  dashboardSignInButton.href = `${BACKEND_URL}/auth/discord?returnTo=${encodeURIComponent(returnTo)}`;
}

function setStatus(message, type = "default") {
  if (!requestStatus) return;
  requestStatus.textContent = message;
  requestStatus.dataset.state = type;
}

function setOwnerStatus(message, type = "default") {
  if (!ownerSupportStatus) return;
  ownerSupportStatus.textContent = message;
  ownerSupportStatus.dataset.state = type;
}

function setDashboardStatus(message) {
  setText(dashboardStatus, message);
}

function getCurrentSettings() {
  return guildSettings?.settings ?? guildSettings ?? null;
}

function setPreviewFromInputs() {
  setText(previewTitle, titleInput?.value || "Session Startup");
  setText(previewMessage, messageInput?.value || "A new roleplay session is starting. Join up and follow the server rules.");
  setText(previewFooter, footerInput?.value || "Powered by Logic Systems");
  if (previewColor && colorInput?.value) {
    previewColor.style.background = colorInput.value;
  }
}

function updatePlanNotice() {
  const activePlan = document.querySelector(".plan-toggle button.active")?.dataset.plan || "free";
  if (!planNotice) return;

  if (activePlan === "premium") {
    planNotice.textContent = "Custom mode is best for servers that want branded templates, deeper setup help, and more hands-on configuration support.";
    return;
  }

  planNotice.textContent = "Logic Systems stays simple: session commands, custom embeds, staff tools, and dashboard editing are all available without a paid plan.";
}

function setActiveServer(id) {
  document.querySelectorAll(".server-card").forEach((el) => {
    const isActive = el.dataset.id === id || el.dataset.server === id;
    el.classList.toggle("active", isActive);
  });
}

function applySettingsToForm(settings) {
  if (!dashboardForm || !settings) return;

  dashboardForm.elements.botName.value = settings.botName || settings.serverName || selectedServerName?.textContent || "Logic RP";
  dashboardForm.elements.prefix.value = settings.prefix || "/";
  dashboardForm.elements.guildId.value = selectedGuildId || "";
  dashboardForm.elements.embedTitle.value = settings.embedTitle || "Session Startup";
  dashboardForm.elements.embedMessage.value = settings.embedMessage || "";
  dashboardForm.elements.embedColor.value = settings.embedColor || "#5865f2";
  dashboardForm.elements.footerText.value = settings.footerText || "Powered by Logic Systems";
  dashboardForm.elements.customEmbeds.checked = Boolean(settings.customEmbeds);
  dashboardForm.elements.embedBuilder.checked = Boolean(settings.embedBuilder);
  dashboardForm.elements.antiRaid.checked = Boolean(settings.antiRaid);

  if (settings.supportCode) {
    setText(supportCodeText, settings.supportCode);
  }

  applyCommandTemplate(activeCommandKey);
  setPreviewFromInputs();
}

function getActiveTemplate() {
  const settings = getCurrentSettings();
  return settings?.commandTemplates?.[activeCommandKey] ?? null;
}

function applyCommandTemplate(commandKey) {
  activeCommandKey = commandKey;
  document.querySelectorAll(".command-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.command === commandKey);
  });

  const template = getCurrentSettings()?.commandTemplates?.[commandKey];
  if (!dashboardForm || !template) return;

  dashboardForm.elements.commandTitle.value = template.title || "";
  dashboardForm.elements.commandColor.value = template.color || "#5865f2";
  dashboardForm.elements.commandMessage.value = template.message || "";
  dashboardForm.elements.commandFooter.value = template.footer || "";
  dashboardForm.elements.commandCooldown.value = template.cooldown || "0";
  dashboardForm.elements.commandPingRole.value = template.pingRole || "";
  dashboardForm.elements.commandChannel.value = template.channel || "";
  dashboardForm.elements.commandEnabled.checked = template.enabled !== false;
}

function renderCommandCards() {
  if (!commandTemplateList) return;

  commandTemplateList.innerHTML = "";
  const settings = getCurrentSettings();

  commandCatalog.forEach((cmd) => {
    const template = settings?.commandTemplates?.[cmd.key];
    const card = document.createElement("div");
    card.className = "command-card";
    card.dataset.command = cmd.key;
    card.innerHTML = `
      <div class="cmd-header">${cmd.name}</div>
      <div class="cmd-desc">${template?.title || cmd.desc}</div>
      <button class="cmd-btn" type="button">Edit Template</button>
    `;

    card.addEventListener("click", () => applyCommandTemplate(cmd.key));
    card.querySelector(".cmd-btn")?.addEventListener("click", (event) => {
      event.stopPropagation();
      applyCommandTemplate(cmd.key);
    });

    commandTemplateList.appendChild(card);
  });

  applyCommandTemplate(activeCommandKey);
}

function renderGuildList(list) {
  if (!serverListContainer) return;

  serverListContainer.innerHTML = "";

  if (!list.length) {
    serverListContainer.innerHTML = '<p class="server-empty">No manageable servers found yet. Sign in with Discord and make sure you have Manage Server permission.</p>';
    return;
  }

  list.forEach((guild) => {
    const card = document.createElement("button");
    card.className = "server-card";
    card.type = "button";
    card.dataset.id = guild.id;
    card.innerHTML = `
      <span>${guild.name}</span>
      <small>${guild.premium ? "Custom mode active" : "Free service"}</small>
    `;
    card.addEventListener("click", () => selectGuild(guild.id));
    serverListContainer.appendChild(card);
  });
}

async function loadUser() {
  setText(supportCodeText, "Loading...");
  setDashboardStatus("Checking your Discord session...");

  try {
    const res = await fetch(`${BACKEND_URL}/api/me`, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      user = null;
      guilds = [];
      guildSettings = null;
      if (res.status === 401) {
        saveSessionToken(null);
      }
      setText(supportCodeText, "Sign in first");
      setDashboardStatus("Sign in with Discord to load your servers.");
      renderGuildList([]);
      return;
    }

    const data = await res.json();
    user = data.user ?? null;
    setText(supportCodeText, data.supportCode || "N/A");
    setDashboardStatus(`Signed in as ${user?.username ?? "Discord user"}`);

    await loadGuilds();
  } catch (error) {
    console.error("Failed to load user", error);
    setText(supportCodeText, "Unavailable");
    setDashboardStatus("Could not connect to the dashboard right now.");
  }
}

async function loadGuilds() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/guilds`, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      renderGuildList([]);
      return;
    }

    const data = await res.json();
    guilds = data.guilds ?? [];
    renderGuildList(guilds);

    if (guilds.length) {
      await selectGuild(guilds[0].id);
    } else {
      setDashboardStatus("No manageable servers found for this Discord account.");
    }
  } catch (error) {
    console.error("Failed to load guilds", error);
    renderGuildList([]);
  }
}

async function selectGuild(guildId) {
  selectedGuildId = guildId;
  setActiveServer(guildId);

  const guild = guilds.find((entry) => entry.id === guildId);
  setText(selectedServerName, guild?.name || "Selected Server");

  await loadGuildSettings(guildId);
}

async function loadGuildSettings(guildId) {
  setDashboardStatus("Loading server settings...");

  try {
    const res = await fetch(`${BACKEND_URL}/api/guilds/${guildId}/settings`, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      setDashboardStatus("Could not load settings for this server.");
      return;
    }

    guildSettings = await res.json();
    const settings = getCurrentSettings();
    const activeGuild = guilds.find((entry) => entry.id === guildId);

    if (settings?.serverName) {
      setText(selectedServerName, settings.serverName);
    }

    setDashboardStatus(`Managing ${activeGuild?.name || settings?.serverName || "your server"}`);
    applySettingsToForm(settings);
    renderCommandCards();
  } catch (error) {
    console.error("Failed to load settings", error);
    setDashboardStatus("Could not load settings for this server.");
  }
}

function buildSettingsPayload() {
  const current = cloneData(getCurrentSettings() || {});
  const templateUpdates = current.commandTemplates || {};

  templateUpdates[activeCommandKey] = {
    ...(templateUpdates[activeCommandKey] || {}),
    title: dashboardForm.elements.commandTitle.value.trim(),
    color: dashboardForm.elements.commandColor.value,
    message: dashboardForm.elements.commandMessage.value.trim(),
    footer: dashboardForm.elements.commandFooter.value.trim(),
    cooldown: String(dashboardForm.elements.commandCooldown.value || "0"),
    pingRole: dashboardForm.elements.commandPingRole.value.trim(),
    channel: dashboardForm.elements.commandChannel.value.trim(),
    enabled: dashboardForm.elements.commandEnabled.checked,
  };

  return {
    ...current,
    botName: dashboardForm.elements.botName.value.trim(),
    prefix: dashboardForm.elements.prefix.value.trim() || "/",
    guildId: dashboardForm.elements.guildId.value.trim(),
    embedTitle: dashboardForm.elements.embedTitle.value.trim(),
    embedMessage: dashboardForm.elements.embedMessage.value.trim(),
    embedColor: dashboardForm.elements.embedColor.value,
    footerText: dashboardForm.elements.footerText.value.trim(),
    customEmbeds: dashboardForm.elements.customEmbeds.checked,
    embedBuilder: dashboardForm.elements.embedBuilder.checked,
    antiRaid: dashboardForm.elements.antiRaid.checked,
    commandTemplates: templateUpdates,
  };
}

async function saveGuildSettings() {
  if (!selectedGuildId || !dashboardForm) return;

  const payload = buildSettingsPayload();

  try {
    const res = await fetch(`${BACKEND_URL}/api/guilds/${selectedGuildId}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setDashboardStatus("Save failed. Please try again.");
      return;
    }

    const data = await res.json();
    guildSettings = {
      ...guildSettings,
      ...data,
    };

    setDashboardStatus("Changes saved successfully.");
    renderCommandCards();
    applySettingsToForm(getCurrentSettings());
  } catch (error) {
    console.error("Failed to save settings", error);
    setDashboardStatus("Save failed. Please try again.");
  }
}

async function submitBotRequest(event) {
  event.preventDefault();
  if (!requestForm) return;

  const formData = new FormData(requestForm);
  const payload = Object.fromEntries(formData.entries());
  setStatus("Sending your request...", "pending");

  try {
    const res = await fetch(`${BACKEND_URL}/api/bot-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setStatus("Your request could not be sent right now. Please try again in a moment.", "error");
      return;
    }

    requestForm.reset();
    setStatus("Request sent. Logic Systems should be able to follow up using the Discord name you provided.", "success");
  } catch (error) {
    console.error("Failed to submit request", error);
    setStatus("Your request could not be sent right now. Please try again in a moment.", "error");
  }
}

async function openOwnerSupport() {
  if (!dashboardForm || !ownerOpenButton) return;

  const adminKey = dashboardForm.elements.adminKey.value.trim();
  const supportCode = dashboardForm.elements.supportCode.value.trim();

  setOwnerStatus("Looking up customer settings...", "pending");

  try {
    const res = await fetch(`${BACKEND_URL}/api/owner/support-access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ adminKey, supportCode }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setOwnerStatus(data.error || "Could not open customer dashboard.", "error");
      return;
    }

    guildSettings = { settings: data.settings, premium: data.premium };
    selectedGuildId = data.guildId;
    setText(selectedServerName, data.settings?.serverName || `Server ${data.guildId}`);
    applySettingsToForm(data.settings);
    renderCommandCards();
    setOwnerStatus("Customer settings loaded. You can review and save changes below.", "success");
    setDashboardStatus(`Owner support mode for ${data.settings?.serverName || data.guildId}`);
  } catch (error) {
    console.error("Failed owner lookup", error);
    setOwnerStatus("Could not open customer dashboard.", "error");
  }
}

async function saveOwnerSupport() {
  if (!selectedGuildId || !dashboardForm) return;

  const adminKey = dashboardForm.elements.adminKey.value.trim();
  const supportCode = dashboardForm.elements.supportCode.value.trim();
  const payload = {
    ...buildSettingsPayload(),
    adminKey,
    supportCode,
  };

  setOwnerStatus("Saving customer changes...", "pending");

  try {
    const res = await fetch(`${BACKEND_URL}/api/owner/guilds/${selectedGuildId}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setOwnerStatus(data.error || "Could not save customer changes.", "error");
      return;
    }

    guildSettings = {
      ...guildSettings,
      ...data,
    };
    setOwnerStatus("Customer settings saved successfully.", "success");
    setDashboardStatus("Customer changes saved.");
  } catch (error) {
    console.error("Failed owner save", error);
    setOwnerStatus("Could not save customer changes.", "error");
  }
}

function attachLivePreview() {
  [titleInput, messageInput, colorInput, footerInput].forEach((input) => {
    input?.addEventListener("input", setPreviewFromInputs);
  });
}

function attachPlanToggle() {
  document.querySelectorAll(".plan-toggle button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".plan-toggle button").forEach((entry) => entry.classList.remove("active"));
      button.classList.add("active");
      updatePlanNotice();
    });
  });
}

function init() {
  loadStoredSessionToken();
  consumeSessionFromHash();
  setInviteLinks();
  setAuthLinks();
  attachLivePreview();
  attachPlanToggle();
  setPreviewFromInputs();
  updatePlanNotice();

  dashboardForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveGuildSettings();
  });

  requestForm?.addEventListener("submit", submitBotRequest);
  ownerOpenButton?.addEventListener("click", openOwnerSupport);
  ownerSaveButton?.addEventListener("click", saveOwnerSupport);

  loadUser();
}

init();
