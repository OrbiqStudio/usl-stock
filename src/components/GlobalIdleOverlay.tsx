import { useLocation } from "react-router-dom";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { IdleOverlay } from "@/screens/direct/components/IdleOverlay";

const IDLE_TIMEOUT_MS = 60_000;

/** Idle screen (white + club logo) kicks in anywhere in the app after 1 min of inactivity, except in the admin space. */
export function GlobalIdleOverlay() {
  const location = useLocation();
  const enabled = !location.pathname.startsWith("/admin");
  const { idle, wake } = useIdleTimer(IDLE_TIMEOUT_MS, enabled);

  if (!idle) return null;
  return <IdleOverlay onWake={wake} />;
}
