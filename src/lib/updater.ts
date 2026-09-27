import { UPDATE_REPO_OWNER, UPDATE_REPO_NAME } from "@/lib/updateConfig";

export const APP_VERSION = __APP_VERSION__;
export const isElectron = typeof window !== "undefined" && !!window.electronAPI;

interface GithubRelease {
  tag_name: string;
  html_url: string;
  assets: { name: string; browser_download_url: string }[];
}

function parseVersion(v: string): number[] {
  return v
    .replace(/^v/, "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
}

/** Returns true if `latest` is strictly newer than `current` (semver-ish comparison). */
export function isNewer(latest: string, current: string): boolean {
  const a = parseVersion(latest);
  const b = parseVersion(current);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}

export interface WebUpdateCheckResult {
  available: boolean;
  latestVersion: string;
  releaseUrl: string;
  apkUrl: string | null;
}

/** Used on Android/web: hits the GitHub Releases API directly (no server needed, stays free). */
export async function checkForUpdateWeb(): Promise<WebUpdateCheckResult> {
  const res = await fetch(
    `https://api.github.com/repos/${UPDATE_REPO_OWNER}/${UPDATE_REPO_NAME}/releases/latest`,
    { headers: { Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) throw new Error("Impossible de vérifier les mises à jour");
  const release = (await res.json()) as GithubRelease;
  const latestVersion = release.tag_name.replace(/^v/, "");
  const apkAsset = release.assets.find((a) => a.name.toLowerCase().endsWith(".apk"));
  return {
    available: isNewer(latestVersion, APP_VERSION),
    latestVersion,
    releaseUrl: release.html_url,
    apkUrl: apkAsset?.browser_download_url ?? null,
  };
}
