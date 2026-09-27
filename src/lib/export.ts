import * as XLSX from "xlsx";
import { articlesCol, commandesCol, matchsCol, dossiersCol } from "@/lib/collections";
import { centsToEuros, formatEuros } from "@/lib/money";
import { MOYEN_PAIEMENT_LABELS, type Commande, type MoyenPaiement } from "@/types";

export type ExportFilter =
  | { type: "match"; matchId: string }
  | { type: "periode"; start: number; end: number }
  | { type: "tout" };

type Row = Record<string, string | number>;

function filterCommandes(filter: ExportFilter): Commande[] {
  const all = commandesCol.getAll();
  if (filter.type === "match") return all.filter((c) => c.matchId === filter.matchId);
  if (filter.type === "periode") return all.filter((c) => c.createdAt >= filter.start && c.createdAt <= filter.end);
  return all;
}

export function generateExcelExport(filter: ExportFilter) {
  const articles = articlesCol.getAll();
  const dossiers = dossiersCol.getAll();
  const matchs = matchsCol.getAll();
  const commandes = filterCommandes(filter);

  const wb = XLSX.utils.book_new();

  // ---- Onglet 1 : Stock actuel ----
  const stockRows: Row[] = articles.map((a) => {
    const dossier = dossiers.find((d) => d.id === a.dossierId);
    return {
      Section: a.section === "boutique" ? "Boutique" : "Buvette",
      Dossier: dossier?.nom ?? "",
      Article: a.nom,
      Stock: a.stock,
      "Seuil alerte": a.seuilAlerte,
      "Prix achat HT (€)": centsToEuros(a.prixAchat),
      "Prix vente TTC (€)": centsToEuros(a.prixVente),
      "TVA %": a.tauxTVA,
      "Valeur stock achat (€)": centsToEuros(a.prixAchat * a.stock),
      "Valeur stock vente (€)": centsToEuros(a.prixVente * a.stock),
      "Marge unitaire (€)": centsToEuros(a.prixVente - a.prixAchat),
      Statut: a.stock === 0 ? "Rupture" : a.stock <= a.seuilAlerte ? "Alerte" : "OK",
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stockRows), "Stock actuel");

  // ---- Onglet 2 : Ventes ----
  const venteRows: Row[] = [];
  commandes
    .filter((c) => c.statut === "payee")
    .forEach((c) => {
      const match = matchs.find((m) => m.id === c.matchId);
      c.lignes.forEach((l) => {
        const article = articles.find((a) => a.id === l.articleId);
        const dossier = article ? dossiers.find((d) => d.id === article.dossierId) : undefined;
        venteRows.push({
          Date: new Date(c.createdAt).toLocaleString("fr-FR"),
          Match: match?.nom ?? "",
          "N° Commande": c.numero,
          Section: c.section === "boutique" ? "Boutique" : "Buvette",
          Dossier: dossier?.nom ?? (l.packId ? "Pack" : ""),
          Article: l.articleNom,
          Quantité: l.quantite,
          "Prix vente TTC (€)": centsToEuros(l.prixUnitaire),
          "Prix achat HT (€)": article ? centsToEuros(article.prixAchat) : "",
          "TVA %": l.tauxTVA,
          "Marge (€)": article ? centsToEuros((l.prixUnitaire - article.prixAchat) * l.quantite) : "",
          "Moyen de paiement": c.moyenPaiement ? MOYEN_PAIEMENT_LABELS[c.moyenPaiement] : "",
        });
      });
    });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(venteRows), "Ventes");

  // ---- Onglet 3 : Résumé ----
  const payees = commandes.filter((c) => c.statut === "payee");
  const annulees = commandes.filter((c) => c.statut === "annulee");
  const ca = payees.reduce((s, c) => s + c.totalTTC, 0);
  const coutVendu = payees.reduce(
    (s, c) =>
      s +
      c.lignes.reduce((sl, l) => {
        const article = articles.find((a) => a.id === l.articleId);
        return sl + (article ? article.prixAchat * l.quantite : 0);
      }, 0),
    0
  );
  const margeTotale = payees.reduce((s, c) => s + c.totalHT, 0) - coutVendu;
  const panierMoyen = payees.length ? ca / payees.length : 0;

  const parMoyen: Partial<Record<MoyenPaiement, number>> = {};
  payees.forEach((c) => {
    if (!c.moyenPaiement) return;
    parMoyen[c.moyenPaiement] = (parMoyen[c.moyenPaiement] ?? 0) + c.totalTTC;
  });

  const topArticles = new Map<string, number>();
  payees.forEach((c) =>
    c.lignes.forEach((l) => topArticles.set(l.articleNom, (topArticles.get(l.articleNom) ?? 0) + l.quantite))
  );
  const top10 = [...topArticles.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  const alerteArticles = articles.filter((a) => a.stock <= a.seuilAlerte);

  const resumeRows: Row[] = [
    { Indicateur: "Valeur totale du stock (achat)", Valeur: formatEuros(articles.reduce((s, a) => s + a.prixAchat * a.stock, 0)) },
    { Indicateur: "Valeur totale du stock (vente)", Valeur: formatEuros(articles.reduce((s, a) => s + a.prixVente * a.stock, 0)) },
    { Indicateur: "Chiffre d'affaires (période sélectionnée)", Valeur: formatEuros(ca) },
    { Indicateur: "Marge totale (période sélectionnée)", Valeur: formatEuros(margeTotale) },
    { Indicateur: "Nombre de commandes payées", Valeur: payees.length },
    { Indicateur: "Panier moyen", Valeur: formatEuros(panierMoyen) },
    { Indicateur: "", Valeur: "" },
    { Indicateur: "--- Répartition par moyen de paiement ---", Valeur: "" },
    ...Object.entries(parMoyen).map(([k, v]) => ({
      Indicateur: MOYEN_PAIEMENT_LABELS[k as MoyenPaiement],
      Valeur: formatEuros(v as number),
    })),
    { Indicateur: "", Valeur: "" },
    { Indicateur: "--- Top 10 articles vendus ---", Valeur: "" },
    ...top10.map(([nom, qty], i) => ({ Indicateur: `${i + 1}. ${nom}`, Valeur: `${qty} vendu(s)` })),
    { Indicateur: "", Valeur: "" },
    { Indicateur: "--- Articles en alerte stock ---", Valeur: "" },
    ...alerteArticles.map((a) => ({ Indicateur: a.nom, Valeur: `${a.stock} restant(s)` })),
    { Indicateur: "", Valeur: "" },
    { Indicateur: "--- Commandes annulées ---", Valeur: "" },
    ...annulees.map((c) => ({ Indicateur: `Commande n°${c.numero}`, Valeur: c.motifAnnulation ?? "" })),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumeRows, { skipHeader: true }), "Résumé");

  // ---- Onglet 4 : Fond de caisse ----
  const matchsForCaisse =
    filter.type === "match"
      ? matchs.filter((m) => m.id === filter.matchId)
      : matchs.filter((m) => m.statut === "termine" || m.statut === "en_cours");

  const caisseRows: Row[] = matchsForCaisse.map((m) => {
    const especes = commandes
      .filter((c) => c.matchId === m.id && c.statut === "payee" && c.moyenPaiement === "especes")
      .reduce((s, c) => s + c.totalTTC, 0);
    const ecart = m.totalFondFinal != null ? m.totalFondFinal - ((m.totalFondInitial ?? 0) + especes) : null;
    return {
      Match: m.nom,
      "Fond initial (€)": m.totalFondInitial != null ? centsToEuros(m.totalFondInitial) : "",
      "Fond final (€)": m.totalFondFinal != null ? centsToEuros(m.totalFondFinal) : "",
      "Recettes espèces (€)": centsToEuros(especes),
      "Écart (€)": ecart != null ? centsToEuros(ecart) : "",
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(caisseRows), "Fond de caisse");

  const filename = `USL-Stock-Export-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
