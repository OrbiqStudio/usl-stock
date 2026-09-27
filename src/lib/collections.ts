import { FirestoreCollection } from "@/lib/firestoreCollection";
import type { Dossier, Article, Match, Commande, Pack, MouvementStock } from "@/types";

export const dossiersCol = new FirestoreCollection<Dossier>("dossiers");
export const articlesCol = new FirestoreCollection<Article>("articles");
export const matchsCol = new FirestoreCollection<Match>("matchs");
export const commandesCol = new FirestoreCollection<Commande>("commandes");
export const packsCol = new FirestoreCollection<Pack>("packs");
export const mouvementsCol = new FirestoreCollection<MouvementStock>("mouvements");
