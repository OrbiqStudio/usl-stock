import { useSyncExternalStore, useCallback } from "react";

interface ReadableCollection<T> {
  getAll(): T[];
  subscribe(listener: () => void): () => void;
}

export function useCollection<T extends { id: string }>(col: ReadableCollection<T>): T[] {
  const subscribe = useCallback((cb: () => void) => col.subscribe(cb), [col]);
  const getSnapshot = useCallback(() => col.getAll(), [col]);
  return useSyncExternalStore(subscribe, getSnapshot);
}
