import { useEffect, useState } from "react";
import { logicTheme } from "../logicTheme";

export default function SystemShell() {
  const [activePage, setActivePage] = useState("dashboard");
  const [commandOpen, setCommandOpen] = useState(false);

  const [embedConfig, setEmbedConfig] = useState(`{
  "title": "Test Embed",
  "description": "Logic Systems Embed",
  "color": "#3B82F6"
}`);

  const [logs, setLogs] = useState([
    "[SYSTEM] Logic Systems initialized",
    "[ENGINE] Embed module standby",
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => [
        `[EVENT] heartbeat ${new Date().toLocaleTimeString()}`,
        ...prev.slice(0, 8),
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navItems = [
    { id: "dashboard", label: "System Overview" },
    { id: "embed", label: "Embed Control" },
    { id: "logs", label: "System Logs" },
    { id: "settings", label: "Configuration Layer" },
  ];

  const runCommand = (cmd) => {
    const c = cmd.toLowerCase();

    if (c.includes("dashboard")) setActivePage("dashboard");
    if (c.includes("embed")) setActivePage("embed");
    if (c.includes("logs")) setActivePage("logs");
    if (c.includes("settings")) setActivePage("settings");

    if (c.includes("clear logs")) {
      setLogs(["[SYSTEM] Logs cleared"]);
    }

    setCommandOpen(false);
  };

  return (
    <div
      style={{
        background: logicTheme.colors.base,
        color: logicTheme.colors.text.primary,
        height: "100vh",
        display: "flex",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* LEFT NAV */}
      <div
        style={{
          width: "260px",
          background: logicTheme.colors.panel,
          borderRight: `1px solid ${logicTheme.colors.border}`,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 10 }}>
          LOGIC SYSTEMS
        </div>

        <div style={{ fontSize: 12, color: logicTheme.colors.text.secondary }}>
          CONTROL CENTER
        </div>

        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: "8px" }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                padding: "10px",
                borderRadius: "6px",
                cursor: "pointer",
                background:
                  activePage === item.id
                    ? logicTheme.colors.panel2
                    : "transparent",
                border:
                  activePage === item.id
                    ? `1px solid ${logicTheme.colors.border}`
                    : "1px solid transparent",
                color:
                  activePage === item.id
                    ? logicTheme.colors.text.primary
                    : logicTheme.colors.text.secondary,
              }}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", fontSize: 11, color: logicTheme.colors.text.muted }}>
          CTRL + K Command Palette
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: 20 }}>
        {activePage === "dashboard" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div
              style={{
                background: logicTheme.colors.panel,
                border: `1px solid ${logicTheme.colors.border}`,
                padding: 20,
              }}
            >
              <h2>System Overview</h2>
              <p style={{ color: logicTheme.colors.text.secondary }}>
                Logic Systems Control Interface Active
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: logicTheme.colors.panel, border: `1px solid ${logicTheme.colors.border}`, padding: 16 }}>
                System Status: ACTIVE
              </div>

              <div style={{ background: logicTheme.colors.panel, border: `1px solid ${logicTheme.colors.border}`, padding: 16 }}>
                Embed Engine: READY
              </div>
            </div>
          </div>
        )}

        {activePage === "embed" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: logicTheme.colors.panel, border: `1px solid ${logicTheme.colors.border}`, padding: 16 }}>
              <h3>Embed Config (JSON)</h3>
              <textarea
                value={embedConfig}
                onChange={(e) => setEmbedConfig(e.target.value)}
                style={{
                  width: "100%",
                  height: "300px",
                  background: logicTheme.colors.base,
                  color: logicTheme.colors.text.primary,
                  border: `1px solid ${logicTheme.colors.border}`,
                  padding: 10,
                  fontFamily: "monospace",
                }}
              />
            </div>

            <div style={{ background: logicTheme.colors.panel, border: `1px solid ${logicTheme.colors.border}`, padding: 16 }}>
              <h3>Live Preview</h3>
              <pre style={{ color: logicTheme.colors.text.secondary }}>
                {embedConfig}
              </pre>
            </div>
          </div>
        )}

        {activePage === "logs" && (
          <div style={{ background: logicTheme.colors.panel, border: `1px solid ${logicTheme.colors.border}`, padding: 16, height: "70vh", overflow: "auto" }}>
            <h3>System Logs</h3>
            {logs.map((log, i) => (
              <div key={i} style={{ fontSize: 12, marginBottom: 6 }}>
                {log}
              </div>
            ))}
          </div>
        )}

        {activePage === "settings" && (
          <div style={{ display: "grid", gap: 16, maxWidth: 500 }}>
            <div style={{ background: logicTheme.colors.panel, border: `1px solid ${logicTheme.colors.border}`, padding: 16 }}>
              <h3>Configuration Layer</h3>

              <label style={{ fontSize: 12 }}>System Name</label>
              <input
                placeholder="Logic Systems"
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 6,
                  background: logicTheme.colors.base,
                  color: logicTheme.colors.text.primary,
                  border: `1px solid ${logicTheme.colors.border}`,
                }}
              />

              <label style={{ fontSize: 12, marginTop: 10 }}>Accent Active</label>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        )}
      </div>

      {/* INSPECTOR */}
      <div
        style={{
          width: "300px",
          background: logicTheme.colors.panel2,
          borderLeft: `1px solid ${logicTheme.colors.border}`,
          padding: 16,
        }}
      >
        <div style={{ fontSize: 12, color: logicTheme.colors.text.muted }}>
          SYSTEM INSPECTOR
        </div>

        <div style={{ marginTop: 10, fontSize: 12 }}>
          Active Module: {activePage.toUpperCase()}
        </div>
      </div>

      {/* COMMAND PALETTE */}
      {commandOpen && (
        <div
          onClick={() => setCommandOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "500px",
              background: logicTheme.colors.panel,
              border: `1px solid ${logicTheme.colors.border}`,
              padding: 16,
            }}
          >
            <h3>Command Palette</h3>
            <input
              autoFocus
              placeholder="Type command (dashboard, embed, logs, settings, clear logs)"
              onKeyDown={(e) => {
                if (e.key === "Enter") runCommand(e.target.value);
              }}
              style={{
                width: "100%",
                padding: 10,
                background: logicTheme.colors.base,
                color: logicTheme.colors.text.primary,
                border: `1px solid ${logicTheme.colors.border}`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}