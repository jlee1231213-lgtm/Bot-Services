const BOT_CLIENT_ID = "1507551249204117535";
const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${BOT_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;
const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://bot-services-uvwb.onrender.com";

const previewTitle = document.querySelector("#previewTitle");
const previewMessage = document.querySelector("#previewMessage");
const previewFooter = document.querySelector("#previewFooter");
const previewFooterIcon = document.querySelector("#previewFooterIcon");
const previewColor = document.querySelector("#previewColor");
const previewImage = document.querySelector("#previewImage");
const previewThumbnail = document.querySelector("#previewThumbnail");
const supportCodeText = document.querySelector("#supportCodeText");
const dashboardStatus = document.querySelector("#dashboardStatus");
const selectedServerName = document.querySelector("#selectedServerName");
const commandTemplateList = document.querySelector("#commandTemplateList");
const serverListContainer = document.querySelector("#serverList");
const serverPanel = document.querySelector("#serverPanel");
const supportCodePanel = document.querySelector("#supportCodePanel");
const requestForm = document.querySelector("#botRequestForm");
const requestStatus = document.querySelector("#requestStatus");
const dashboardForm = document.querySelector("#dashboardForm");
const ownerOpenButton = document.querySelector("#ownerOpenButton");
const ownerSaveButton = document.querySelector("#ownerSaveButton");
const ownerSupportStatus = document.querySelector("#ownerSupportStatus");
const planNotice = document.querySelector("#planNotice");
const dashboardSignInButton = document.querySelector("#dashboardSignInButton");
const dashboardSignInWrap = document.querySelector("#dashboardSignInWrap");
const inviteTargets = [
  document.querySelector("#inviteButton"),
  document.querySelector("#inviteButtonHero"),
  document.querySelector("#inviteButtonBottom"),
];

const titleInput = document.querySelector("#embedTitleInput");
const messageInput = document.querySelector("#embedMessageInput");
const colorInput = document.querySelector("#embedColorInput");
const footerInput = document.querySelector("#footerTextInput");
const embedImageInput = document.querySelector("#embedImageInput");
const embedThumbnailInput = document.querySelector("#embedThumbnailInput");
const footerIconInput = document.querySelector("#footerIconInput");
const commandTitleInput = dashboardForm?.elements.commandTitle ?? null;
const commandMessageInput = dashboardForm?.elements.commandMessage ?? null;
const commandColorInput = dashboardForm?.elements.commandColor ?? null;
const commandFooterInput = dashboardForm?.elements.commandFooter ?? null;
const commandFooterIconInput = dashboardForm?.elements.commandFooterIcon ?? null;
const commandImageInput = dashboardForm?.elements.commandImage ?? null;
const commandThumbnailInput = dashboardForm?.elements.commandThumbnail ?? null;

const commandCatalog = [
  { key: "announce", name: "ANNOUNCE", desc: "Post a custom server announcement." },
  { key: "antiraid", name: "ANTIRAID", desc: "Show or update anti-raid status." },
  { key: "balance", name: "BALANCE", desc: "Check a member economy balance." },
  { key: "ban", name: "BAN", desc: "Ban a member with a clean log." },
  { key: "cohost", name: "COHOST", desc: "Start co-host tracking." },
  { key: "cohost-end", name: "COHOST END", desc: "End co-host tracking." },
  { key: "deposit", name: "DEPOSIT", desc: "Deposit money into an account." },
  { key: "dmall", name: "DMALL", desc: "DM members in bulk." },
  { key: "ea", name: "EA", desc: "Announce early access." },
  { key: "embed", name: "EMBED", desc: "Send a custom embed." },
  { key: "fullmod", name: "FULLMOD", desc: "Mark moderation coverage as full." },
  { key: "give-money", name: "GIVE MONEY", desc: "Give money to a member." },
  { key: "hatepings", name: "HATEPINGS", desc: "Configure unwanted ping handling." },
  { key: "help", name: "HELP", desc: "Show command help." },
  { key: "join-vc", name: "JOIN VC", desc: "Ask a member to join voice chat." },
  { key: "kick", name: "KICK", desc: "Kick a member with a clean log." },
  { key: "lowmod", name: "LOWMOD", desc: "Alert staff about low moderation." },
  { key: "membercount", name: "MEMBERCOUNT", desc: "Show server member count." },
  { key: "modcall", name: "MODCALL", desc: "Request moderator help." },
  { key: "mute", name: "MUTE", desc: "Mute a member." },
  { key: "over", name: "OVER", desc: "Announce session over." },
  { key: "payticket", name: "PAYTICKET", desc: "Handle payment tickets." },
  { key: "peacetime", name: "PEACETIME", desc: "Update peacetime status." },
  { key: "priority", name: "PRIORITY", desc: "Set priority availability." },
  { key: "profile", name: "PROFILE", desc: "Show a member profile." },
  { key: "quota", name: "QUOTA", desc: "Track staff quota." },
  { key: "register", name: "REGISTER", desc: "Register a member profile." },
  { key: "reinvites", name: "REINVITES", desc: "Handle reinvite waves cleanly." },
  { key: "release", name: "RELEASE", desc: "Open the session publicly." },
  { key: "reset-over-cooldown", name: "RESET OVER COOLDOWN", desc: "Reset over command cooldown." },
  { key: "reset-startup-cooldown", name: "RESET STARTUP COOLDOWN", desc: "Reset startup command cooldown." },
  { key: "rules", name: "RULES", desc: "Post server rules." },
  { key: "say", name: "SAY", desc: "Make the bot say a message." },
  { key: "scene", name: "SCENE", desc: "Post active scene information." },
  { key: "settings", name: "SETTINGS", desc: "Show or edit bot settings." },
  { key: "setup", name: "SETUP", desc: "Run server setup." },
  { key: "ssd", name: "SSD", desc: "Wrap sessions up clearly." },
  { key: "ssu", name: "SSU", desc: "Start a session startup." },
  { key: "staff", name: "STAFF", desc: "Post staff-focused notices." },
  { key: "staff-profile", name: "STAFF PROFILE", desc: "Show a staff profile." },
  { key: "startup", name: "STARTUP", desc: "Launch a session announcement." },
  { key: "status", name: "STATUS", desc: "Show current server status." },
  { key: "supervise", name: "SUPERVISE", desc: "Supervise a member or scene." },
  { key: "ticket", name: "TICKET", desc: "Create or manage tickets." },
  { key: "unmute", name: "UNMUTE", desc: "Unmute a member." },
  { key: "unregister", name: "UNREGISTER", desc: "Remove a member registration." },
  { key: "vote", name: "VOTE", desc: "Start a vote." },
  { key: "warn", name: "WARN", desc: "Warn a member." },
  { key: "warrant", name: "WARRANT", desc: "Create a warrant notice." },
  { key: "withdraw", name: "WITHDRAW", desc: "Withdraw money from an account." },
  { key: "work", name: "WORK", desc: "Work for economy money." },
];

let user = null;
let guilds = [];
let selectedGuildId = null;
let guildSettings = null;
let activeCommandKey = "startup";
let sessionToken = null;
let previewMode = "embed";

function setText(el, text) {
  if (el) el.textContent = text;
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value ?? {}));
}

function cleanUrl(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function setPreviewImage(image, url) {
  if (!image) return;
  const safeUrl = cleanUrl(url);
  image.hidden = !safeUrl;
  if (safeUrl) {
    image.src = safeUrl;
  } else {
    image.removeAttribute("src");
  }
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

function setDashboardAuthState(isSignedIn) {
  if (serverPanel) {
    serverPanel.hidden = !isSignedIn;
  }

  if (dashboardSignInButton) {
    dashboardSignInButton.textContent = "Sign in with Discord";
    dashboardSignInButton.hidden = isSignedIn;
  }

  if (dashboardSignInWrap) {
    dashboardSignInWrap.hidden = isSignedIn;
  }
}

function setDashboardRetrySignIn(shouldShow) {
  if (dashboardSignInButton) {
    dashboardSignInButton.textContent = "Sign in again with Discord";
    dashboardSignInButton.hidden = !shouldShow;
  }

  if (dashboardSignInWrap) {
    dashboardSignInWrap.hidden = !shouldShow;
  }
}

function setDashboardServerState(hasServer) {
  dashboardForm?.classList.toggle("is-empty", !hasServer);

  if (supportCodePanel) {
    supportCodePanel.hidden = !hasServer;
  }

  if (hasServer) {
    setDashboardRetrySignIn(false);
  }

  if (!hasServer) {
    selectedGuildId = null;
    guildSettings = null;
    setText(selectedServerName, "No server selected");
    setText(supportCodeText, "Select a server");
  }
}

function getCurrentSettings() {
  return guildSettings?.settings ?? guildSettings ?? null;
}

function applyPreviewContent({ title, message, footer, color, image, thumbnail, footerIcon }) {
  setText(previewTitle, title || "Session Startup");
  setText(previewMessage, message || "A new roleplay session is starting. Join up and follow the server rules.");
  setText(previewFooter, footer || "Powered by Logic Systems");
  if (previewColor) {
    previewColor.style.background = color || "#5865f2";
  }
  setPreviewImage(previewImage, image);
  setPreviewImage(previewThumbnail, thumbnail);
  setPreviewImage(previewFooterIcon, footerIcon);
}

function setEmbedPreviewFromInputs() {
  applyPreviewContent({
    title: titleInput?.value,
    message: messageInput?.value,
    footer: footerInput?.value,
    color: colorInput?.value,
    image: embedImageInput?.value,
    thumbnail: embedThumbnailInput?.value,
    footerIcon: footerIconInput?.value,
  });
}

function setCommandPreviewFromInputs() {
  applyPreviewContent({
    title: commandTitleInput?.value,
    message: commandMessageInput?.value,
    footer: commandFooterInput?.value,
    color: commandColorInput?.value,
    image: commandImageInput?.value,
    thumbnail: commandThumbnailInput?.value,
    footerIcon: commandFooterIconInput?.value,
  });
}

function refreshPreview() {
  if (previewMode === "command") {
    setCommandPreviewFromInputs();
    return;
  }

  setEmbedPreviewFromInputs();
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
  dashboardForm.elements.embedImage.value = settings.embedImage || "";
  dashboardForm.elements.embedThumbnail.value = settings.embedThumbnail || "";
  dashboardForm.elements.footerIcon.value = settings.footerIcon || "";
  dashboardForm.elements.customEmbeds.checked = Boolean(settings.customEmbeds);
  dashboardForm.elements.embedBuilder.checked = Boolean(settings.embedBuilder);
  dashboardForm.elements.antiRaid.checked = Boolean(settings.antiRaid);

  if (settings.supportCode) {
    setText(supportCodeText, settings.supportCode);
  }

  applyCommandTemplate(activeCommandKey);
  refreshPreview();
}

function getActiveTemplate() {
  const settings = getCurrentSettings();
  return settings?.commandTemplates?.[activeCommandKey] ?? null;
}

function getDefaultCommandTemplate(commandKey) {
  const command = commandCatalog.find((entry) => entry.key === commandKey);
  return {
    title: command?.name || commandKey.toUpperCase(),
    color: "#5865f2",
    message: command?.desc || "Command response template.",
    footer: "Powered by Logic Systems",
    footerIcon: "",
    image: "",
    thumbnail: "",
    cooldown: "0",
    pingRole: "",
    channel: "",
    enabled: true,
  };
}

function ensureCommandTemplates(settings) {
  settings.commandTemplates ??= {};
  commandCatalog.forEach((command) => {
    settings.commandTemplates[command.key] ??= getDefaultCommandTemplate(command.key);
  });
  return settings.commandTemplates;
}

function readCommandTemplateFromForm(commandKey = activeCommandKey) {
  const fallback = getDefaultCommandTemplate(commandKey);
  if (!dashboardForm) return fallback;

  return {
    ...fallback,
    title: dashboardForm.elements.commandTitle.value.trim() || fallback.title,
    color: dashboardForm.elements.commandColor.value || fallback.color,
    message: dashboardForm.elements.commandMessage.value.trim() || fallback.message,
    footer: dashboardForm.elements.commandFooter.value.trim() || fallback.footer,
    footerIcon: cleanUrl(dashboardForm.elements.commandFooterIcon.value),
    image: cleanUrl(dashboardForm.elements.commandImage.value),
    thumbnail: cleanUrl(dashboardForm.elements.commandThumbnail.value),
    cooldown: String(dashboardForm.elements.commandCooldown.value || fallback.cooldown),
    pingRole: dashboardForm.elements.commandPingRole.value.trim(),
    channel: dashboardForm.elements.commandChannel.value.trim(),
    enabled: dashboardForm.elements.commandEnabled.checked,
  };
}

function saveActiveCommandTemplateDraft() {
  const settings = getCurrentSettings();
  if (!settings || !dashboardForm || !activeCommandKey) return;
  const templates = ensureCommandTemplates(settings);
  templates[activeCommandKey] = {
    ...(templates[activeCommandKey] || getDefaultCommandTemplate(activeCommandKey)),
    ...readCommandTemplateFromForm(activeCommandKey),
  };
}

function applyCommandTemplate(commandKey) {
  if (activeCommandKey && activeCommandKey !== commandKey) {
    saveActiveCommandTemplateDraft();
  }

  activeCommandKey = commandKey;
  document.querySelectorAll(".command-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.command === commandKey);
  });

  const settings = getCurrentSettings();
  const template = ensureCommandTemplates(settings || {})[commandKey] || getDefaultCommandTemplate(commandKey);
  if (!dashboardForm) return;

  dashboardForm.elements.commandTitle.value = template.title || "";
  dashboardForm.elements.commandColor.value = template.color || "#5865f2";
  dashboardForm.elements.commandMessage.value = template.message || "";
  dashboardForm.elements.commandFooter.value = template.footer || "";
  dashboardForm.elements.commandFooterIcon.value = template.footerIcon || "";
  dashboardForm.elements.commandImage.value = template.image || "";
  dashboardForm.elements.commandThumbnail.value = template.thumbnail || "";
  dashboardForm.elements.commandCooldown.value = template.cooldown || "0";
  dashboardForm.elements.commandPingRole.value = template.pingRole || "";
  dashboardForm.elements.commandChannel.value = template.channel || "";
  dashboardForm.elements.commandEnabled.checked = template.enabled !== false;
  previewMode = "command";
  refreshPreview();
}

function renderCommandCards() {
  if (!commandTemplateList) return;

  commandTemplateList.innerHTML = "";
  const settings = getCurrentSettings();
  if (settings) ensureCommandTemplates(settings);

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
    const message = user
      ? "No servers found with the bot installed. Add the Logic Systems bot to a server you manage, then refresh this page."
      : "Sign in with Discord to load your servers.";
    serverListContainer.innerHTML = `<p class="server-empty">${message}</p>`;
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
  setDashboardAuthState(false);
  setDashboardServerState(false);
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
      setDashboardAuthState(false);
      setDashboardServerState(false);
      setText(supportCodeText, "Sign in first");
      setDashboardStatus("Sign in with Discord to load your servers.");
      renderGuildList([]);
      return;
    }

    const data = await res.json();
    user = data.user ?? null;
    setDashboardAuthState(true);
    setDashboardServerState(false);
    setText(supportCodeText, data.supportCode || "N/A");
    setDashboardStatus(`Signed in as ${user?.username ?? "Discord user"}`);

    await loadGuilds();
  } catch (error) {
    console.error("Failed to load user", error);
    setDashboardAuthState(false);
    setDashboardServerState(false);
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
      setDashboardServerState(false);
      setDashboardRetrySignIn(true);
      setDashboardStatus("Signed in, but the bot is not in any manageable servers yet.");
    }
  } catch (error) {
    console.error("Failed to load guilds", error);
    setDashboardServerState(false);
    setDashboardRetrySignIn(Boolean(user));
    renderGuildList([]);
  }
}

async function selectGuild(guildId) {
  selectedGuildId = guildId;
  setDashboardServerState(true);
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
    setDashboardServerState(true);
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
  const templateUpdates = ensureCommandTemplates(current);
  templateUpdates[activeCommandKey] = readCommandTemplateFromForm(activeCommandKey);

  return {
    ...current,
    botName: dashboardForm.elements.botName.value.trim(),
    prefix: dashboardForm.elements.prefix.value.trim() || "/",
    guildId: dashboardForm.elements.guildId.value.trim(),
    embedTitle: dashboardForm.elements.embedTitle.value.trim(),
    embedMessage: dashboardForm.elements.embedMessage.value.trim(),
    embedColor: dashboardForm.elements.embedColor.value,
    footerText: dashboardForm.elements.footerText.value.trim(),
    embedImage: cleanUrl(dashboardForm.elements.embedImage.value),
    embedThumbnail: cleanUrl(dashboardForm.elements.embedThumbnail.value),
    footerIcon: cleanUrl(dashboardForm.elements.footerIcon.value),
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
    setDashboardServerState(true);
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
  [titleInput, messageInput, colorInput, footerInput, embedImageInput, embedThumbnailInput, footerIconInput].forEach((input) => {
    input?.addEventListener("input", () => {
      previewMode = "embed";
      refreshPreview();
    });
  });

  [commandTitleInput, commandMessageInput, commandColorInput, commandFooterInput, commandFooterIconInput, commandImageInput, commandThumbnailInput].forEach((input) => {
    input?.addEventListener("input", () => {
      previewMode = "command";
      refreshPreview();
    });
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
  setDashboardAuthState(false);
  refreshPreview();
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
