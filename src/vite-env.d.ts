/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface UpdateStatus {
  state: "available" | "up-to-date" | "downloading" | "ready" | "error";
  version?: string;
  percent?: number;
  message?: string;
}

interface ElectronAPI {
  isElectron: true;
  currentVersion: () => Promise<string>;
  checkForUpdate: () => Promise<{ version?: string; error?: string }>;
  downloadUpdate: () => Promise<{ ok?: boolean; error?: string }>;
  quitAndInstall: () => Promise<void>;
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => () => void;
}

interface Window {
  electronAPI?: ElectronAPI;
}
