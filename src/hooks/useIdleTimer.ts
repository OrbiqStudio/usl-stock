import { useCallback, useEffect, useRef, useState } from "react";

export function useIdleTimer(timeoutMs: number, enabled: boolean) {
  const [idle, setIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (enabled) {
      timerRef.current = setTimeout(() => setIdle(true), timeoutMs);
    }
  }, [enabled, timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      setIdle(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    reset();
    const events: (keyof WindowEventMap)[] = ["click", "touchstart", "keydown", "mousemove"];
    events.forEach((e) => window.addEventListener(e, reset));
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, timeoutMs]);

  return { idle, wake: reset };
}
