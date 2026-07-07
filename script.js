const BOT_CLIENT_ID = "1507551249204117535";

const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://bot-services-uvwb.onrender.com";

/* -----------------------------
   STATE (NOVEX PRO UI DASHBOARD)
------------------------------*/

let user = null;
let guilds = [];
let selectedGuildId = null;
let guildSettings = null;
let isLoading = false;

/* -----------------------------
   ELEMENTS
------------------------------*/

const supportCodeText = document.querySelector("#supportCodeText");
const dashboardStatus = document.querySelector("#dashboardStatus");
const selectedServerName = document.querySelector("#selectedServerName");
const commandTemplateList = document.querySelector("#commandTemplateList");
const serverListContainer = document.querySelector("#serverList");

/* -----------------------------
   UI HELPERS (NOVEX STYLE)
------------------------------*/

function setText(el, text) {
  if (el) el.textContent = text;
}

function setActiveServer(id) {
  document.querySelectorAll(".server-card").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === id);
  });
}

function toast(msg) {
  console.log("[Novex Dashboard]", msg);
}

/* -----------------------------
   AUTH
------------------------------*/

async function loadUser() {
  isLoading = true;

  setText(supportCodeText, "Loading...");
  setText(dashboardStatus, "Connecting to Novex...");

  try {
    const res = await fetch(`${BACKEND_URL}/api/me`, {
      credentials: "include"
    });

    if (!res.ok) {
      user = null;
      guilds = [];
      guildSettings = null;

      setText(supportCodeText, "Sign in with Discord");
      setText(dashboardStatus, "Not signed in");

      renderGuildList([]);
      return;
    }

    const data = await res.json();
    user = data.user;

    setText(supportCodeText, data.supportCode || "N/A");
    setText(dashboardStatus, `Welcome, ${user.username}`);

    await loadGuilds();
  } catch (err) {
    console.error(err);
    setText(supportCodeText, "Error");
    setText(dashboardStatus, "Connection failed");
  } finally {
    isLoading = false;
  }
}

/* -----------------------------
   GUILDS (NOVEX SIDEBAR)
------------------------------*/

async function loadGuilds() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/guilds`, {
      credentials: "include"
    });

    if (!res.ok) return;

    guilds = await res.json();

    renderGuildList(guilds);

    if (guilds.length > 0) {
      selectGuild(guilds[0].id);
    }
  } catch (err) {
    console.error("Guild error:", err);
  }
}

function renderGuildList(list) {
  if (!serverListContainer) return;

  serverListContainer.innerHTML = "";

  list.forEach((g) => {
    const card = document.createElement("div");
    card.className = "server-card";
    card.dataset.id = g.id;
    card.innerHTML = `
      <div class="server-name">${g.name}</div>
      <div class="server-sub">Server</div>
    `;

    card.addEventListener("click", () => selectGuild(g.id));

    serverListContainer.appendChild(card);
  });
}

/* -----------------------------
   GUILD SELECT
------------------------------*/

async function selectGuild(guildId) {
  selectedGuildId = guildId;

  setActiveServer(guildId);

  const guild = guilds.find((g) => g.id === guildId);
  if (guild) {
    setText(selectedServerName, guild.name);
  }

  await loadGuildSettings(guildId);
}

/* -----------------------------
   SETTINGS
------------------------------*/

async function loadGuildSettings(guildId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/guild/${guildId}`, {
      credentials: "include"
    });

    if (!res.ok) return;

    guildSettings = await res.json();

    renderDashboard();
  } catch (err) {
    console.error("Settings error:", err);
  }
}

/* -----------------------------
   DASHBOARD (NOVEX PRO UI)
------------------------------*/

function renderDashboard() {
  if (!guildSettings) return;

  setText(dashboardStatus, `Managing ${guildSettings.serverName}`);

  if (!commandTemplateList) return;

  commandTemplateList.innerHTML = "";

  const commands = [
    { name: "STARTUP", desc: "Server session initialization" },
    { name: "RELEASE", desc: "Session release broadcast" },
    { name: "OVER", desc: "Session termination alert" }
  ];

  commands.forEach((cmd) => {
    const el = document.createElement("div");
    el.className = "command-card";

    el.innerHTML = `
      <div class="cmd-header">${cmd.name}</div>
      <div class="cmd-desc">${cmd.desc}</div>
      <button class="cmd-btn">Configure</button>
    `;

    el.querySelector(".cmd-btn").addEventListener("click", () => {
      toast(`Opening ${cmd.name} editor`);
    });

    commandTemplateList.appendChild(el);
  });
}

/* -----------------------------
   SAVE SETTINGS
------------------------------*/

async function saveGuildSettings(update) {
  if (!selectedGuildId) return;

  try {
    await fetch(`${BACKEND_URL}/api/guild/${selectedGuildId}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(update)
    });

    toast("Saved successfully");
  } catch (err) {
    console.error(err);
    toast("Save failed");
  }
}

/* -----------------------------
   INIT
------------------------------*/

loadUser();