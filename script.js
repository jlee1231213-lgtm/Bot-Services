const BOT_CLIENT_ID = "1507551249204117535";
const STORAGE_KEY = "logic-systems-dashboard";
const SESSION_STORAGE_KEY = "logic-systems-session";
const PADDLE_CLIENT_TOKEN = "live_dc4683003cbffc6a174bbe866a3";
const PADDLE_PRICE_ID = "pri_01ks9d2ry6by4xvfrjf0xad17t";
const PADDLE_ENVIRONMENT = "production";
const BACKEND_URL = "https://bot-services-uvwb.onrender.com";

const inviteUrl =
  BOT_CLIENT_ID === "YOUR_BOT_CLIENT_ID"
    ? "#"
    : `https://discord.com/oauth2/authorize?client_id=${BOT_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

document.querySelectorAll("#inviteButton, #inviteButtonBottom").forEach((button) => {
  button.href = inviteUrl;
  if (inviteUrl === "#") {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      alert("Add your Discord bot client ID in script.js first.");
    });
  }
});

const defaults = {
  main: {
    serverName: "Logic RP",
    plan: "free",
    botName: "Logic RP",
    guildId: "",
    prefix: "/",
    embedTitle: "Session Startup",
    embedMessage: "A new roleplay session is starting. Join up and follow the server rules.",
    embedColor: "#3c43ec",
    footerText: "Powered by Logic Systems",
    customEmbeds: false,
    embedBuilder: false,
    antiRaid: false,
  },
  premium: {
    serverName: "Premium Demo",
    plan: "premium",
    botName: "Premium Demo",
    guildId: "",
    prefix: "/",
    embedTitle: "Premium Session",
    embedMessage: "Your custom premium embed is ready for startup, release, reinvites, or over commands.",
    embedColor: "#76f0d2",
    footerText: "Logic Systems Premium",
    customEmbeds: true,
    embedBuilder: true,
    antiRaid: true,
  },
};

let selectedServer = "main";
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
  return state[selectedServer];
}

function setServer(serverId) {
  selectedServer = serverId;
  document.querySelectorAll(".server-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.server === selectedServer);
  });
  renderDashboard();
}

function setPlan(plan) {
  if (plan === "premium") {
    openPremiumCheckout();
    return;
  }

  currentBot().plan = plan;
  if (plan === "free") {
    currentBot().footerText = "Powered by Logic Systems";
    currentBot().customEmbeds = false;
    currentBot().embedBuilder = false;
    currentBot().antiRaid = false;
  } else {
    currentBot().customEmbeds = true;
    currentBot().embedBuilder = true;
  }
  saveState();
  renderDashboard();
}

function renderDashboard() {
  const bot = currentBot();
  const isPremium = bot.plan === "premium";

  selectedServerName.textContent = bot.serverName;
  mainPlanLabel.textContent = `${state.main.plan === "premium" ? "Premium" : "Free"} plan`;

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

  document.querySelectorAll("[data-plan]").forEach((button) => {
    button.classList.toggle("active", button.dataset.plan === bot.plan);
  });

  form.elements.embedTitle.disabled = !isPremium;
  form.elements.embedMessage.disabled = !isPremium;
  form.elements.embedColor.disabled = !isPremium;
  form.elements.footerText.disabled = !isPremium;
  form.elements.customEmbeds.disabled = !isPremium;
  form.elements.embedBuilder.disabled = !isPremium;
  form.elements.antiRaid.disabled = !isPremium;

  document.querySelectorAll(".toggle-row").forEach((row) => {
    row.classList.toggle("locked", !isPremium);
  });

  planNotice.textContent = isPremium
    ? "Premium is active: custom embeds, in-bot embed building, footer editing, and anti-raid protection are unlocked."
    : "Free plan is active: basic roleplay commands work, and embeds keep the Logic Systems footer. Premium tools unlock after payment.";

  updatePreview();
}

function updatePreview() {
  const bot = currentBot();
  const isPremium = bot.plan === "premium";
  const color = isPremium ? form.elements.embedColor.value : "#3c43ec";
  const title = isPremium ? form.elements.embedTitle.value : "Logic Systems Embed";
  const message = isPremium
    ? form.elements.embedMessage.value
    : "Free plan embeds use the standard Logic Systems style for startup, EA, setup, release, reinvites, and over commands.";
  const footer = isPremium ? form.elements.footerText.value : "Powered by Logic Systems";

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

  if (bot.plan === "premium") {
    bot.embedTitle = form.elements.embedTitle.value.trim() || "Untitled Embed";
    bot.embedMessage = form.elements.embedMessage.value.trim() || "Embed message preview";
    bot.embedColor = form.elements.embedColor.value;
    bot.footerText = form.elements.footerText.value.trim() || "Logic Systems Premium";
    bot.customEmbeds = form.elements.customEmbeds.checked;
    bot.embedBuilder = form.elements.embedBuilder.checked;
    bot.antiRaid = form.elements.antiRaid.checked;
  }
}

document.querySelectorAll(".server-card").forEach((card) => {
  card.addEventListener("click", () => setServer(card.dataset.server));
});

document.querySelectorAll("[data-plan]").forEach((button) => {
  button.addEventListener("click", () => setPlan(button.dataset.plan));
});

document.querySelectorAll("[data-plan-jump]").forEach((button) => {
  button.href = "#premium";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    openPremiumCheckout();
  });
});

const upgradeButton = document.querySelector("#upgradeButton");
if (upgradeButton) {
  upgradeButton.href = "#premium";
  upgradeButton.addEventListener("click", (event) => {
    event.preventDefault();
    openPremiumCheckout();
  });
}

function openPremiumCheckout() {
  collectForm();
  saveState();

  if (PADDLE_CLIENT_TOKEN === "YOUR_PADDLE_CLIENT_TOKEN") {
    alert("Add your Paddle client-side token in script.js to enable Premium checkout.");
    document.querySelector("#premium").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (!currentBot().guildId) {
    alert("Paste your Discord server ID in the dashboard before buying Premium.");
    document.querySelector("#dashboard").scrollIntoView({ behavior: "smooth" });
    form.elements.guildId.focus();
    return;
  }

  if (!window.Paddle) {
    alert("Paddle checkout did not load yet. Refresh the page and try again.");
    return;
  }

  if (!window.logicPaddleReady) {
    if (PADDLE_ENVIRONMENT === "sandbox" && window.Paddle.Environment) {
      window.Paddle.Environment.set("sandbox");
    }

    window.Paddle.Initialize({
      token: PADDLE_CLIENT_TOKEN,
      eventCallback(event) {
        if (event.name === "checkout.completed") {
          alert("Payment complete. Premium access still needs to be activated by Logic Systems.");
        }
      },
    });
    window.logicPaddleReady = true;
  }

  window.Paddle.Checkout.open({
    customData: {
      guildId: currentBot().guildId,
      botName: currentBot().botName,
    },
    items: [
      {
        priceId: PADDLE_PRICE_ID,
        quantity: 1,
      },
    ],
  });
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

renderDashboard();
initDiscordDashboard();

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
    window.location.href = `${BACKEND_URL}/auth/discord`;
  });
  dashboardHead.append(loginButton);

  if (BACKEND_URL === "YOUR_BACKEND_URL") return;
  if (!sessionToken) return;

  try {
    const me = await apiGet("/api/me");
    loginButton.textContent = `Signed in: ${me.user.globalName || me.user.username}`;

    const { guilds } = await apiGet("/api/guilds");
    loggedInGuilds = guilds;
    renderLoggedInGuilds(guilds);
  } catch {
    loginButton.textContent = "Sign in with Discord";
  }
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
    card.innerHTML = `<span>${guild.name}</span><small>${guild.premium ? "Premium plan" : "Free plan"}</small>`;
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
    plan: premium ? "premium" : "free",
    botName: guild.name,
    guildId: guild.id,
    prefix: "/",
    embedTitle: settings.embedTitle,
    embedMessage: settings.embedMessage,
    embedColor: settings.embedColor,
    footerText: settings.footerText,
    customEmbeds: Boolean(settings.customEmbeds),
    embedBuilder: premium,
    antiRaid: premium,
  };
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

function getAuthHeaders() {
  return sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {};
}

async function parseApiResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}
