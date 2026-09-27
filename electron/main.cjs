const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { autoUpdater } = require("electron-updater");

const isDev = !app.isPackaged;
autoUpdater.autoDownload = false;

let mainWindow = null;

function send(channel, payload) {
  mainWindow?.webContents.send(channel, payload);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.maximize();
    mainWindow.show();
    if (!isDev) {
      mainWindow.setFullScreen(true);
    }
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ---------- Auto-update (user-triggered from the admin "Mises à jour" button) ----------

ipcMain.handle("update:check", async () => {
  if (isDev) return { status: "up-to-date", version: app.getVersion() };
  try {
    const result = await autoUpdater.checkForUpdates();
    return { version: result?.updateInfo?.version ?? app.getVersion() };
  } catch (err) {
    return { error: String(err?.message ?? err) };
  }
});

ipcMain.handle("update:download", async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { ok: true };
  } catch (err) {
    return { error: String(err?.message ?? err) };
  }
});

ipcMain.handle("update:install", () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle("update:currentVersion", () => app.getVersion());

autoUpdater.on("update-available", (info) => send("update:status", { state: "available", version: info.version }));
autoUpdater.on("update-not-available", () => send("update:status", { state: "up-to-date" }));
autoUpdater.on("download-progress", (p) =>
  send("update:status", { state: "downloading", percent: Math.round(p.percent) })
);
autoUpdater.on("update-downloaded", () => send("update:status", { state: "ready" }));
autoUpdater.on("error", (err) => send("update:status", { state: "error", message: String(err?.message ?? err) }));
