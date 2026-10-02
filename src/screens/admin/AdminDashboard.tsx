import { useMemo, useState, useEffect } from "react";
import { Package, Wallet, PiggyBank, Download } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { articlesCol, commandesCol } from "@/lib/collections";
import { useMatchs } from "@/hooks/useData";
import { formatEuros } from "@/lib/money";
import { generateExcelExport } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { TYPE_MATCH_LABELS, MOYEN_PAIEMENT_LABELS, type MoyenPaiement } from "@/types";
import { cn } from "@/lib/utils";

function HeroCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-between rounded-3xl bg-foreground p-6 text-background">
      <span className="text-sm text-background/60">{label}</span>
      <span className="mt-6 text-3xl font-bold tracking-tight">{value}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-border bg-white p-6">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="mt-6 text-3xl font-bold tracking-tight">{value}</span>
    </div>
  );
}

const BAR_ORDER: MoyenPaiement[] = ["especes", "cb", "cheque", "autre"];

function PaymentBarChart({ parMoyen }: { parMoyen: Record<MoyenPaiement, number> }) {
  const max = Math.max(...BAR_ORDER.map((k) => parMoyen[k]), 1);

  return (
    <div className="rounded-3xl border border-border bg-white p-6">
      <span className="text-sm font-semibold">Encaissements par moyen de paiement</span>
      <div className="mt-8 flex h-44 items-end gap-4 px-2">
        {BAR_ORDER.map((key) => {
          const value = parMoyen[key];
          const heightPct = Math.max(4, Math.round((value / max) * 100));
          const isMax = value === max && value > 0;
          return (
            <div key={key} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {value > 0 ? formatEuros(value) : ""}
              </span>
              <div className="flex h-32 w-full items-end">
                <div
                  className={cn("w-full rounded-t-lg transition-all", isMax ? "bg-primary" : "bg-foreground/85")}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{MOYEN_PAIEMENT_LABELS[key]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STATUT_LABELS: Record<string, string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  termine: "Terminé",
};

export function AdminDashboard() {
  const articles = useCollection(articlesCol);
  const allCommandes = useCollection(commandesCol);
  const matchs = useMatchs();

  const [matchId, setMatchId] = useState<string>("");

  useEffect(() => {
    if (!matchId && matchs.length > 0) {
      const active = matchs.find((m) => m.statut === "en_cours");
      setMatchId(active?.id ?? matchs[0].id);
    }
  }, [matchs, matchId]);

  const selectedMatch = matchs.find((m) => m.id === matchId);
  const commandes = useMemo(
    () => (matchId ? allCommandes.filter((c) => c.matchId === matchId) : allCommandes),
    [allCommandes, matchId]
  );

  const stats = useMemo(() => {
    const nbArticles = articles.length;
    const nbAlerte = articles.filter((a) => a.stock <= a.seuilAlerte).length;
    const valeurAchat = articles.reduce((s, a) => s + a.prixAchat * a.stock, 0);
    const valeurVente = articles.reduce((s, a) => s + a.prixVente * a.stock, 0);

    const payees = commandes.filter((c) => c.statut === "payee");
    const ca = payees.reduce((s, c) => s + c.totalTTC, 0);
    const coutVendu = payees.reduce((s, c) => {
      return (
        s +
        c.lignes.reduce((sl, l) => {
          const article = articles.find((a) => a.id === l.articleId);
          return sl + (article ? article.prixAchat * l.quantite : 0);
        }, 0)
      );
    }, 0);
    const caHT = payees.reduce((s, c) => s + c.totalHT, 0);
    const marge = caHT - coutVendu;

    const parMoyen: Record<MoyenPaiement, number> = { especes: 0, cb: 0, cheque: 0, autre: 0 };
    payees.forEach((c) => {
      if (c.moyenPaiement) parMoyen[c.moyenPaiement] += c.totalTTC;
    });

    return { nbArticles, nbAlerte, valeurAchat, valeurVente, ca, marge, nbCommandes: payees.length, parMoyen };
  }, [articles, commandes]);

  function handleExport() {
    if (!matchId) return;
    generateExcelExport({ type: "match", matchId });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={matchId} onValueChange={setMatchId}>
          <SelectTrigger className="w-64 rounded-full border-border bg-white">
            <SelectValue placeholder="Choisir un match" />
          </SelectTrigger>
          <SelectContent>
            {matchs.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.nom} — {new Date(m.date).toLocaleDateString("fr-FR")}
                {m.statut === "en_cours" ? " (en cours)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleExport} disabled={!matchId} className="rounded-full">
          <Download className="h-4 w-4" /> Exporter ce match
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HeroCard label="Chiffre d'affaires" value={formatEuros(stats.ca)} />
        <StatCard label="Marge estimée" value={formatEuros(stats.marge)} />
        <StatCard label="Commandes payées" value={String(stats.nbCommandes)} />
        <StatCard label="Articles en alerte" value={String(stats.nbAlerte)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <PaymentBarChart parMoyen={stats.parMoyen} />

        <div className="rounded-3xl border border-border bg-white p-6">
          <span className="text-sm font-semibold">Match sélectionné</span>
          {selectedMatch ? (
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <div className="text-lg font-bold leading-tight">{selectedMatch.nom}</div>
                <div className="text-sm text-muted-foreground">
                  {TYPE_MATCH_LABELS[selectedMatch.type]} · {new Date(selectedMatch.date).toLocaleDateString("fr-FR")}
                </div>
              </div>
              <span
                className={cn(
                  "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                  selectedMatch.statut === "en_cours"
                    ? "bg-usl-success-light text-success"
                    : selectedMatch.statut === "termine"
                      ? "bg-usl-gray text-muted-foreground"
                      : "bg-usl-blue-light text-primary"
                )}
              >
                {STATUT_LABELS[selectedMatch.statut]}
              </span>
              <div className="mt-1 flex flex-col gap-2 border-t border-border pt-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fond initial</span>
                  <span className="font-semibold">
                    {selectedMatch.totalFondInitial != null ? formatEuros(selectedMatch.totalFondInitial) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fond final</span>
                  <span className="font-semibold">
                    {selectedMatch.totalFondFinal != null ? formatEuros(selectedMatch.totalFondFinal) : "—"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Aucun match</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-6 rounded-3xl border border-border bg-white px-6 py-5">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <div className="text-xs text-muted-foreground">Articles au total</div>
            <div className="text-base font-bold">{stats.nbArticles}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <div className="text-xs text-muted-foreground">Valeur stock (achat)</div>
            <div className="text-base font-bold">{formatEuros(stats.valeurAchat)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PiggyBank className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <div className="text-xs text-muted-foreground">Valeur stock (vente)</div>
            <div className="text-base font-bold">{formatEuros(stats.valeurVente)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
