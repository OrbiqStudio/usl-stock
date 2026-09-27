import { useMemo, useState, useEffect } from "react";
import {
  Package,
  TriangleAlert,
  Wallet,
  TrendingUp,
  Receipt,
  PiggyBank,
  Banknote,
  CreditCard,
  ScrollText,
  CircleDollarSign,
  Download,
} from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { articlesCol, commandesCol } from "@/lib/collections";
import { useMatchs } from "@/hooks/useData";
import { formatEuros } from "@/lib/money";
import { generateExcelExport } from "@/lib/export";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { TYPE_MATCH_LABELS, type MoyenPaiement } from "@/types";

function StatCard({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm text-muted-foreground">{label}</div>
          <div className="truncate text-xl font-extrabold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

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
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex flex-1 flex-col gap-2">
            <span className="text-sm font-semibold text-muted-foreground">Match</span>
            <Select value={matchId} onValueChange={setMatchId}>
              <SelectTrigger className="max-w-sm">
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
          </div>
          {selectedMatch && (
            <div className="text-sm text-muted-foreground">
              {TYPE_MATCH_LABELS[selectedMatch.type]} · {stats.nbCommandes} commande
              {stats.nbCommandes > 1 ? "s" : ""} payée{stats.nbCommandes > 1 ? "s" : ""}
            </div>
          )}
          <Button onClick={handleExport} disabled={!matchId}>
            <Download className="h-4 w-4" /> Export Excel de ce match
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Package className="h-6 w-6" />}
          label="Articles au total"
          value={String(stats.nbArticles)}
          colorClass="bg-usl-blue-light text-primary"
        />
        <StatCard
          icon={<TriangleAlert className="h-6 w-6" />}
          label="Articles en alerte stock"
          value={String(stats.nbAlerte)}
          colorClass="bg-usl-danger-light text-destructive"
        />
        <StatCard
          icon={<Wallet className="h-6 w-6" />}
          label="Valeur du stock (achat)"
          value={formatEuros(stats.valeurAchat)}
          colorClass="bg-usl-warning-light text-usl-warning"
        />
        <StatCard
          icon={<PiggyBank className="h-6 w-6" />}
          label="Valeur du stock (vente)"
          value={formatEuros(stats.valeurVente)}
          colorClass="bg-usl-success-light text-success"
        />
        <StatCard
          icon={<Receipt className="h-6 w-6" />}
          label="Chiffre d'affaires (match sélectionné)"
          value={formatEuros(stats.ca)}
          colorClass="bg-usl-blue-light text-primary"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Marge estimée (match sélectionné)"
          value={formatEuros(stats.marge)}
          colorClass="bg-usl-success-light text-success"
        />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-bold">Détail des encaissements — {selectedMatch?.nom ?? "…"}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Banknote className="h-6 w-6" />}
            label="Espèces"
            value={formatEuros(stats.parMoyen.especes)}
            colorClass="bg-usl-success-light text-success"
          />
          <StatCard
            icon={<CreditCard className="h-6 w-6" />}
            label="Carte bancaire"
            value={formatEuros(stats.parMoyen.cb)}
            colorClass="bg-usl-blue-light text-primary"
          />
          <StatCard
            icon={<ScrollText className="h-6 w-6" />}
            label="Chèque"
            value={formatEuros(stats.parMoyen.cheque)}
            colorClass="bg-usl-warning-light text-usl-warning"
          />
          <StatCard
            icon={<CircleDollarSign className="h-6 w-6" />}
            label="Autre"
            value={formatEuros(stats.parMoyen.autre)}
            colorClass="bg-usl-gray text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}
