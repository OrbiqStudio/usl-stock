import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Config } from "@/types";
import { COUPURES_DEFAUT } from "@/types";

const DEFAULT_PASSWORD = "usl2024";
const configRef = doc(db, "config", "singleton");

const FALLBACK_CONFIG: Config = {
  adminPasswordHash: "",
  clubName: "US Laval Basket",
  coupuresActives: COUPURES_DEFAUT,
};

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type Listener = () => void;
const listeners = new Set<Listener>();

// Cached doc — getConfig() must return a *stable* reference between calls
// (required by useSyncExternalStore) unless the underlying data actually
// changed, otherwise React re-renders forever.
let cachedConfig: Config | null = null;
let docExists = false;

onSnapshot(configRef, (snap) => {
  docExists = snap.exists();
  if (docExists) {
    cachedConfig = snap.data() as Config;
    listeners.forEach((l) => l());
  }
});

let initPromise: Promise<Config> | null = null;

export async function ensureConfig(): Promise<Config> {
  if (cachedConfig) return cachedConfig;
  if (!initPromise) {
    initPromise = (async () => {
      const adminPasswordHash = await sha256(DEFAULT_PASSWORD);
      const config: Config = {
        adminPasswordHash,
        clubName: "US Laval Basket",
        coupuresActives: COUPURES_DEFAUT,
      };
      if (!docExists) {
        await setDoc(configRef, config, { merge: true });
      }
      return config;
    })();
  }
  return initPromise;
}

export function getConfig(): Config {
  return cachedConfig ?? FALLBACK_CONFIG;
}

export function updateConfig(patch: Partial<Config>) {
  void updateDoc(configRef, patch);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const config = getConfig();
  const hash = await sha256(password);
  return hash === config.adminPasswordHash;
}

export async function setAdminPassword(newPassword: string) {
  const hash = await sha256(newPassword);
  updateConfig({ adminPasswordHash: hash });
}

export function subscribeConfig(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
