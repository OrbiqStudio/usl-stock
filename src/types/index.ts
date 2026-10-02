export type Section = "boutique" | "buvette";

export type TypeMatch = "championnat" | "coupe_de_france" | "amical";

export type StatutMatch = "planifie" | "en_cours" | "termine";

export type MoyenPaiement = "especes" | "cb" | "cheque" | "autre";

export type StatutCommande = "en_cours" | "payee" | "annulee";

export interface Dossier {
  id: string;
  section: Section;
  nom: string;
  icone: string;
  ordre: number;
  createdAt: number;
  updatedAt: number;
}

export type Contenance = "25cl" | "33cl" | "50cl";

export const CONTENANCES: Contenance[] = ["25cl", "33cl", "50cl"];

export interface Article {
  id: string;
  dossierId: string;
  section: Section;
  nom: string;
  imageUrl: string | null;
  stock: number;
  /** en centimes */
  prixAchat: number;
  /** en centimes, TTC — prix par défaut, ignoré si estAlcool est vrai */
  prixVente: number;
  tauxTVA: 5.5 | 10 | 20;
  seuilAlerte: number;
  favori: boolean;
  /** Si vrai, la vente demande de choisir une contenance ; prixVente est ignoré au profit de contenances[x]. */
  estAlcool: boolean;
  /** en centimes, TTC — prix par contenance activée (clé absente = contenance non proposée) */
  contenances: Partial<Record<Contenance, number>>;
  /**
   * Si vrai (uniquement pertinent avec la contenance 25cl = 1 verre), le stock du match ne se
   * saisit pas directement : on entre le nombre de bouteilles de 1L / 1,5L et `stock` (en verres)
   * est recalculé automatiquement (1L = 4 verres, 1,5L = 6 verres).
   */
  stockEnBouteilles: boolean;
  bouteilles1L: number;
  bouteilles15L: number;
  /** Si vrai, une consigne (CONSIGNE_PRIX) s'ajoute automatiquement à la vente de cet article. */
  consigneAuto: boolean;
  createdAt: number;
  updatedAt: number;
}

export const VERRES_PAR_BOUTEILLE_1L = 4;
export const VERRES_PAR_BOUTEILLE_15L = 6;

export interface MouvementStock {
  id: string;
  articleId: string;
  delta: number;
  motif: string;
  createdAt: number;
}

export type CoupureCle =
  | "1c" | "2c" | "5c" | "10c" | "20c" | "50c"
  | "1e" | "2e" | "5e" | "10e" | "20e" | "50e" | "100e" | "200e" | "500e";

export interface FondCaisse {
  [coupure: string]: number;
}

export interface Match {
  id: string;
  nom: string;
  date: number;
  type: TypeMatch;
  statut: StatutMatch;
  fondCaisseInitial: FondCaisse | null;
  fondCaisseFinal: FondCaisse | null;
  totalFondInitial: number | null;
  totalFondFinal: number | null;
  compteurCommande: number;
  createdAt: number;
  updatedAt: number;
}

export interface LigneCommande {
  articleId: string;
  articleNom: string;
  quantite: number;
  /** en centimes, TTC */
  prixUnitaire: number;
  tauxTVA: number;
  /** en centimes */
  sousTotal: number;
  packId?: string;
  contenance?: Contenance;
  /** Articles choisis par le client pour les "choix" (slots) de ce pack, en plus des articles fixes du pack. */
  packChoix?: { articleId: string; articleNom: string }[];
}

export interface Remise {
  type: "pourcentage" | "montant";
  valeur: number;
}

export interface Commande {
  id: string;
  matchId: string;
  numero: number;
  section: Section;
  lignes: LigneCommande[];
  remise: Remise | null;
  montantRemise: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  moyenPaiement: MoyenPaiement | null;
  montantRecu: number | null;
  renduMonnaie: number | null;
  statut: StatutCommande;
  motifAnnulation: string | null;
  tabletteId: string;
  createdAt: number;
  updatedAt: number;
}

export interface PackArticle {
  articleId: string;
  articleNom: string;
  quantite: number;
}

/** Une option proposée dans un "choix" de pack (ex: une boisson au choix), avec son ajustement de prix. */
export interface PackSlotOption {
  articleId: string;
  articleNom: string;
  /** en centimes, TTC — s'ajoute au prix du pack (peut être négatif, ex: -50 pour une boisson moins chère) */
  prixDelta: number;
}

/** Un choix que le client doit faire à la vente du pack (ex: "Boisson", "Sandwich"). */
export interface PackSlot {
  id: string;
  label: string;
  options: PackSlotOption[];
}

export interface Pack {
  id: string;
  nom: string;
  section: Section;
  /** Articles toujours inclus dans le pack (en plus des choix éventuels). */
  articles: PackArticle[];
  /** Choix laissés au client (ex: boisson, sandwich) — vide si le pack est entièrement fixe. */
  slots: PackSlot[];
  prixPack: number;
  tauxTVA: number;
  imageUrl: string | null;
  actif: boolean;
  createdAt: number;
}

export const CONSIGNE_ARTICLE_ID = "__consigne__";
export const CONSIGNE_NOM = "Consigne verre";
/** en centimes */
export const CONSIGNE_PRIX = 100;
export const CONSIGNE_TVA = 20;

export interface Config {
  adminPasswordHash: string;
  clubName: string;
  coupuresActives: CoupureCle[];
}

export const COUPURES_LABELS: Record<CoupureCle, string> = {
  "1c": "1 centime",
  "2c": "2 centimes",
  "5c": "5 centimes",
  "10c": "10 centimes",
  "20c": "20 centimes",
  "50c": "50 centimes",
  "1e": "1 €",
  "2e": "2 €",
  "5e": "5 €",
  "10e": "10 €",
  "20e": "20 €",
  "50e": "50 €",
  "100e": "100 €",
  "200e": "200 €",
  "500e": "500 €",
};

export const COUPURES_VALEURS: Record<CoupureCle, number> = {
  "1c": 1,
  "2c": 2,
  "5c": 5,
  "10c": 10,
  "20c": 20,
  "50c": 50,
  "1e": 100,
  "2e": 200,
  "5e": 500,
  "10e": 1000,
  "20e": 2000,
  "50e": 5000,
  "100e": 10000,
  "200e": 20000,
  "500e": 50000,
};

export const COUPURES_DEFAUT: CoupureCle[] = [
  "50c", "1e", "2e", "5e", "10e", "20e", "50e",
];

export const TYPE_MATCH_LABELS: Record<TypeMatch, string> = {
  championnat: "Championnat",
  coupe_de_france: "Coupe de France",
  amical: "Amical",
};

export const MOYEN_PAIEMENT_LABELS: Record<MoyenPaiement, string> = {
  especes: "Espèces",
  cb: "Carte bancaire",
  cheque: "Chèque",
  autre: "Autre",
};
