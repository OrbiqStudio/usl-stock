import { dossiersCol, articlesCol, matchsCol, commandesCol, packsCol, mouvementsCol } from "@/lib/collections";
import type {
  Dossier,
  Article,
  Match,
  Commande,
  Pack,
  Section,
  TypeMatch,
  LigneCommande,
  Remise,
  MoyenPaiement,
  FondCaisse,
  PackArticle,
  Contenance,
} from "@/types";
import { ttcToHt } from "@/lib/money";
import { nextCommandeNumero as reserveNextCommandeNumero } from "@/lib/transactions";

// ---------- Dossiers ----------

export function listDossiers(section: Section): Dossier[] {
  return dossiersCol
    .getAll()
    .filter((d) => d.section === section)
    .sort((a, b) => a.ordre - b.ordre);
}

export function createDossier(section: Section, nom: string, icone: string): Dossier {
  const now = Date.now();
  const ordre = listDossiers(section).length;
  const dossier: Dossier = {
    id: crypto.randomUUID(),
    section,
    nom,
    icone,
    ordre,
    createdAt: now,
    updatedAt: now,
  };
  dossiersCol.add(dossier);
  return dossier;
}

export function updateDossier(id: string, patch: Partial<Pick<Dossier, "nom" | "icone">>) {
  dossiersCol.update(id, { ...patch, updatedAt: Date.now() });
}

export function deleteDossier(id: string) {
  articlesCol
    .getAll()
    .filter((a) => a.dossierId === id)
    .forEach((a) => articlesCol.remove(a.id));
  dossiersCol.remove(id);
}

// ---------- Articles ----------

export function listArticles(dossierId: string): Article[] {
  return articlesCol.getAll().filter((a) => a.dossierId === dossierId);
}

export function listArticlesBySection(section: Section): Article[] {
  return articlesCol.getAll().filter((a) => a.section === section);
}

export function listFavoris(section: Section): Article[] {
  return listArticlesBySection(section).filter((a) => a.favori);
}

export function getArticle(id: string): Article | undefined {
  return articlesCol.get(id);
}

export interface CreateArticleInput {
  dossierId: string;
  section: Section;
  nom: string;
  imageUrl: string | null;
  stock: number;
  prixAchat: number;
  prixVente: number;
  tauxTVA: 5.5 | 10 | 20;
  seuilAlerte: number;
  favori: boolean;
  estAlcool: boolean;
  contenances: Partial<Record<Contenance, number>>;
  stockEnBouteilles: boolean;
  bouteilles1L: number;
  bouteilles15L: number;
}

export function createArticle(input: CreateArticleInput): Article {
  const now = Date.now();
  const article: Article = { id: crypto.randomUUID(), ...input, createdAt: now, updatedAt: now };
  articlesCol.add(article);
  return article;
}

export function updateArticle(id: string, patch: Partial<Omit<Article, "id" | "createdAt">>) {
  articlesCol.update(id, { ...patch, updatedAt: Date.now() });
}

export function deleteArticle(id: string) {
  articlesCol.remove(id);
}

export function adjustStock(articleId: string, delta: number, motif: string) {
  // Atomic server-side increment — safe against concurrent sales from other tablettes.
  articlesCol.incrementField(articleId, "stock", delta);
  articlesCol.update(articleId, { updatedAt: Date.now() });
  mouvementsCol.add({
    id: crypto.randomUUID(),
    articleId,
    delta,
    motif,
    createdAt: Date.now(),
  });
}

// ---------- Matchs ----------

export function listMatchs(): Match[] {
  return matchsCol.getAll().sort((a, b) => b.date - a.date);
}

export function getMatch(id: string): Match | undefined {
  return matchsCol.get(id);
}

export function getActiveMatch(): Match | undefined {
  return matchsCol.getAll().find((m) => m.statut === "en_cours");
}

export function createMatch(nom: string, date: number, type: TypeMatch): Match {
  const now = Date.now();
  const match: Match = {
    id: crypto.randomUUID(),
    nom,
    date,
    type,
    statut: "planifie",
    fondCaisseInitial: null,
    fondCaisseFinal: null,
    totalFondInitial: null,
    totalFondFinal: null,
    compteurCommande: 0,
    createdAt: now,
    updatedAt: now,
  };
  matchsCol.add(match);
  return match;
}

export function deleteMatch(id: string) {
  matchsCol.remove(id);
}

export function startMatch(id: string, fondCaisseInitial: FondCaisse, total: number) {
  if (getActiveMatch()) {
    throw new Error("Un match est déjà en cours. Terminez-le avant d'en démarrer un autre.");
  }
  matchsCol.update(id, {
    statut: "en_cours",
    fondCaisseInitial,
    totalFondInitial: total,
    compteurCommande: 0,
    updatedAt: Date.now(),
  });
}

export function endMatch(id: string, fondCaisseFinal: FondCaisse, total: number) {
  matchsCol.update(id, {
    statut: "termine",
    fondCaisseFinal,
    totalFondFinal: total,
    updatedAt: Date.now(),
  });
}

// ---------- Totaux commande ----------

export function computeTotals(lignes: LigneCommande[], remise: Remise | null) {
  const sousTotalTTC = lignes.reduce((sum, l) => sum + l.sousTotal, 0);

  let montantRemise = 0;
  if (remise) {
    montantRemise =
      remise.type === "pourcentage"
        ? Math.round((sousTotalTTC * remise.valeur) / 100)
        : Math.min(remise.valeur, sousTotalTTC);
  }

  const totalTTC = sousTotalTTC - montantRemise;

  // Répartit la remise proportionnellement par ligne pour calculer la TVA finale
  let totalHT = 0;
  let totalTVA = 0;
  lignes.forEach((l) => {
    const part = sousTotalTTC > 0 ? l.sousTotal / sousTotalTTC : 0;
    const ligneApresRemise = l.sousTotal - montantRemise * part;
    const { ht, tva } = ttcToHt(Math.round(ligneApresRemise), l.tauxTVA);
    totalHT += ht;
    totalTVA += tva;
  });

  return { totalHT, totalTVA, totalTTC, montantRemise };
}

// ---------- Commandes ----------

export function listCommandesByMatch(matchId: string): Commande[] {
  return commandesCol.getAll().filter((c) => c.matchId === matchId);
}

export function listCommandesEnCoursAutres(matchId: string, tabletteId: string): Commande[] {
  return commandesCol
    .getAll()
    .filter((c) => c.matchId === matchId && c.statut === "en_cours" && c.tabletteId !== tabletteId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getCommande(id: string): Commande | undefined {
  return commandesCol.get(id);
}

export async function createCommande(
  matchId: string,
  section: Section,
  tabletteId: string
): Promise<Commande> {
  const numero = await reserveNextCommandeNumero(matchId);
  const now = Date.now();
  const commande: Commande = {
    id: crypto.randomUUID(),
    matchId,
    numero,
    section,
    lignes: [],
    remise: null,
    montantRemise: 0,
    totalHT: 0,
    totalTVA: 0,
    totalTTC: 0,
    moyenPaiement: null,
    montantRecu: null,
    renduMonnaie: null,
    statut: "en_cours",
    motifAnnulation: null,
    tabletteId,
    createdAt: now,
    updatedAt: now,
  };
  commandesCol.add(commande);
  return commande;
}

function recomputeAndSave(commande: Commande, lignes: LigneCommande[], remise: Remise | null) {
  const totals = computeTotals(lignes, remise);
  commandesCol.update(commande.id, {
    lignes,
    remise,
    ...totals,
    updatedAt: Date.now(),
  });
}

export function addArticleToCommande(
  commandeId: string,
  article: Article,
  quantite = 1,
  contenance?: Contenance
) {
  const commande = commandesCol.get(commandeId);
  if (!commande) return;
  const prixUnitaire =
    article.estAlcool && contenance ? (article.contenances[contenance] ?? 0) : article.prixVente;
  const articleNom = contenance ? `${article.nom} (${contenance})` : article.nom;
  const lignes = [...commande.lignes];
  const existing = lignes.find(
    (l) => l.articleId === article.id && !l.packId && l.contenance === contenance
  );
  if (existing) {
    existing.quantite += quantite;
    existing.sousTotal = existing.quantite * existing.prixUnitaire;
  } else {
    lignes.push({
      articleId: article.id,
      articleNom,
      quantite,
      prixUnitaire,
      tauxTVA: article.tauxTVA,
      sousTotal: prixUnitaire * quantite,
      ...(contenance ? { contenance } : {}),
    });
  }
  recomputeAndSave(commande, lignes, commande.remise);
}

export function addPackToCommande(commandeId: string, pack: Pack) {
  const commande = commandesCol.get(commandeId);
  if (!commande) return;
  const lignes = [...commande.lignes];
  lignes.push({
    articleId: pack.id,
    articleNom: pack.nom,
    quantite: 1,
    prixUnitaire: pack.prixPack,
    tauxTVA: pack.tauxTVA,
    sousTotal: pack.prixPack,
    packId: pack.id,
  });
  recomputeAndSave(commande, lignes, commande.remise);
}

export function updateLigneQuantite(commandeId: string, index: number, quantite: number) {
  const commande = commandesCol.get(commandeId);
  if (!commande) return;
  const lignes = [...commande.lignes];
  if (quantite <= 0) {
    lignes.splice(index, 1);
  } else {
    lignes[index] = { ...lignes[index], quantite, sousTotal: lignes[index].prixUnitaire * quantite };
  }
  recomputeAndSave(commande, lignes, commande.remise);
}

export function removeLigne(commandeId: string, index: number) {
  const commande = commandesCol.get(commandeId);
  if (!commande) return;
  const lignes = commande.lignes.filter((_, i) => i !== index);
  recomputeAndSave(commande, lignes, commande.remise);
}

export function setRemise(commandeId: string, remise: Remise | null) {
  const commande = commandesCol.get(commandeId);
  if (!commande) return;
  recomputeAndSave(commande, commande.lignes, remise);
}

export function payerCommande(
  commandeId: string,
  moyenPaiement: MoyenPaiement,
  montantRecu: number | null
) {
  const commande = commandesCol.get(commandeId);
  if (!commande) return;

  const renduMonnaie =
    moyenPaiement === "especes" && montantRecu != null
      ? Math.max(0, montantRecu - commande.totalTTC)
      : null;

  commande.lignes.forEach((ligne) => {
    if (ligne.packId) {
      const pack = packsCol.get(ligne.packId);
      pack?.articles.forEach((pa: PackArticle) => {
        adjustStock(pa.articleId, -pa.quantite * ligne.quantite, `Vente pack ${pack.nom}`);
      });
    } else {
      adjustStock(ligne.articleId, -ligne.quantite, "Vente");
    }
  });

  commandesCol.update(commandeId, {
    statut: "payee",
    moyenPaiement,
    montantRecu,
    renduMonnaie,
    updatedAt: Date.now(),
  });
}

export function annulerCommande(commandeId: string, motif: string) {
  commandesCol.update(commandeId, {
    statut: "annulee",
    motifAnnulation: motif,
    updatedAt: Date.now(),
  });
}

// ---------- Packs ----------

export function listPacks(section: Section): Pack[] {
  return packsCol.getAll().filter((p) => p.section === section && p.actif);
}

export function listAllPacks(): Pack[] {
  return packsCol.getAll();
}

export interface CreatePackInput {
  nom: string;
  section: Section;
  articles: PackArticle[];
  prixPack: number;
  tauxTVA: number;
  imageUrl: string | null;
}

export function createPack(input: CreatePackInput): Pack {
  const pack: Pack = { id: crypto.randomUUID(), ...input, actif: true, createdAt: Date.now() };
  packsCol.add(pack);
  return pack;
}

export function updatePack(id: string, patch: Partial<Omit<Pack, "id" | "createdAt">>) {
  packsCol.update(id, patch);
}

export function deletePack(id: string) {
  packsCol.remove(id);
}
