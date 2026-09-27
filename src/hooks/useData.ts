import { useMemo, useSyncExternalStore, useCallback, useState, useEffect } from "react";
import { useCollection } from "@/hooks/useCollection";
import { dossiersCol, articlesCol, matchsCol, commandesCol, packsCol } from "@/lib/collections";
import { getConfig, subscribeConfig, ensureConfig } from "@/lib/config";
import { getTabletteId } from "@/lib/tablet";
import type { Section, Config } from "@/types";

export function useDossiers(section: Section) {
  const all = useCollection(dossiersCol);
  return useMemo(
    () => all.filter((d) => d.section === section).sort((a, b) => a.ordre - b.ordre),
    [all, section]
  );
}

export function useArticles(dossierId: string | undefined) {
  const all = useCollection(articlesCol);
  return useMemo(() => all.filter((a) => a.dossierId === dossierId), [all, dossierId]);
}

export function useArticlesBySection(section: Section) {
  const all = useCollection(articlesCol);
  return useMemo(() => all.filter((a) => a.section === section), [all, section]);
}

export function useFavoris(section: Section) {
  const all = useArticlesBySection(section);
  return useMemo(() => all.filter((a) => a.favori), [all]);
}

export function useMatchs() {
  const all = useCollection(matchsCol);
  return useMemo(() => [...all].sort((a, b) => b.date - a.date), [all]);
}

export function useActiveMatch() {
  const all = useCollection(matchsCol);
  return useMemo(() => all.find((m) => m.statut === "en_cours"), [all]);
}

export function useCommande(commandeId: string | undefined) {
  const all = useCollection(commandesCol);
  return useMemo(() => all.find((c) => c.id === commandeId), [all, commandeId]);
}

export function useCommandesByMatch(matchId: string | undefined) {
  const all = useCollection(commandesCol);
  return useMemo(() => all.filter((c) => c.matchId === matchId), [all, matchId]);
}

export function useCommandesEnCoursAutres(matchId: string | undefined, tabletteId: string) {
  const all = useCollection(commandesCol);
  return useMemo(
    () =>
      all
        .filter((c) => c.matchId === matchId && c.statut === "en_cours" && c.tabletteId !== tabletteId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [all, matchId, tabletteId]
  );
}

export function usePacks(section: Section) {
  const all = useCollection(packsCol);
  return useMemo(() => all.filter((p) => p.section === section && p.actif), [all, section]);
}

export function useAllPacks() {
  return useCollection(packsCol);
}

export function useTabletteId() {
  const [id] = useState(() => getTabletteId());
  return id;
}

export function useConfig(): Config {
  useEffect(() => {
    ensureConfig();
  }, []);
  const subscribe = useCallback((cb: () => void) => subscribeConfig(cb), []);
  return useSyncExternalStore(subscribe, getConfig);
}
