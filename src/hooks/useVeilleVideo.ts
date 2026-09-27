import { useEffect, useState } from "react";

const VIDEO_PATH = "./veille.mp4";

/**
 * The idle-mode video is a static file dropped by the club into public/veille.mp4
 * at build time (bundled with the app) — no admin upload needed. We just check
 * once that the file actually exists before wiring it into the <video> tag.
 */
export function useVeilleVideoUrl(): string | null {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(VIDEO_PATH, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setAvailable(res.ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return available ? VIDEO_PATH : null;
}
