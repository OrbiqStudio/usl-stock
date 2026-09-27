import { useState } from "react";
import { Plus, Play, Square, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useMatchs, useConfig } from "@/hooks/useData";
import { useCollection } from "@/hooks/useCollection";
import { commandesCol } from "@/lib/collections";
import { deleteMatch, endMatch, startMatch } from "@/lib/data";
import { MatchFormDialog } from "@/screens/admin/MatchFormDialog";
import { FondCaisseDialog } from "@/screens/admin/FondCaisseDialog";
import { TYPE_MATCH_LABELS, type FondCaisse, type Match } from "@/types";
import { formatEuros } from "@/lib/money";
import { toast } from "sonner";

const STATUT_BADGE: Record<Match["statut"], { label: string; variant: "success" | "secondary" | "outline" }> = {
  en_cours: { label: "En cours", variant: "success" },
  planifie: { label: "Planifié", variant: "outline" },
  termine: { label: "Terminé", variant: "secondary" },
};

export function AdminMatchsTab() {
  const matchs = useMatchs();
  const config = useConfig();
  const commandes = useCollection(commandesCol);
  const activeMatch = matchs.find((m) => m.statut === "en_cours");

  const [createOpen, setCreateOpen] = useState(false);
  const [startTarget, setStartTarget] = useState<Match | null>(null);
  const [endTarget, setEndTarget] = useState<Match | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Match | null>(null);

  function handleStart(fond: FondCaisse, total: number) {
    if (!startTarget) return;
    try {
      startMatch(startTarget.id, fond, total);
      toast.success(`Match "${startTarget.nom}" démarré`);
    } catch (e) {
      toast.error((e as Error).message);
    }
    setStartTarget(null);
  }

  function handleEnd(fond: FondCaisse, total: number) {
    if (!endTarget) return;
    endMatch(endTarget.id, fond, total);
    toast.success(`Match "${endTarget.nom}" terminé`);
    setEndTarget(null);
  }

  function expectedTotalForEnd(match: Match) {
    const especesEncaissees = commandes
      .filter((c) => c.matchId === match.id && c.statut === "payee" && c.moyenPaiement === "especes")
      .reduce((s, c) => s + c.totalTTC, 0);
    return (match.totalFondInitial ?? 0) + especesEncaissees;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Matchs</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-5 w-5" /> Créer un match
        </Button>
      </div>

      {matchs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
          <Calendar className="h-10 w-10 opacity-40" />
          <p>Aucun match préconfiguré</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {matchs.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{m.nom}</span>
                  <Badge variant={STATUT_BADGE[m.statut].variant}>{STATUT_BADGE[m.statut].label}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(m.date).toLocaleDateString("fr-FR")} · {TYPE_MATCH_LABELS[m.type]}
                  {m.statut === "termine" && m.totalFondFinal != null && (
                    <> · Caisse finale : {formatEuros(m.totalFondFinal)}</>
                  )}
                </div>
              </div>

              {m.statut === "planifie" && (
                <Button
                  size="sm"
                  variant="success"
                  disabled={!!activeMatch}
                  onClick={() => setStartTarget(m)}
                  title={activeMatch ? "Un match est déjà en cours" : undefined}
                >
                  <Play className="h-4 w-4" /> Démarrer
                </Button>
              )}
              {m.statut === "en_cours" && (
                <Button size="sm" variant="destructive" onClick={() => setEndTarget(m)}>
                  <Square className="h-4 w-4" /> Terminer
                </Button>
              )}
              {m.statut !== "en_cours" && (
                <Button size="icon-sm" variant="ghost" onClick={() => setDeleteTarget(m)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <MatchFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      {startTarget && (
        <FondCaisseDialog
          open={!!startTarget}
          onOpenChange={(o) => !o && setStartTarget(null)}
          title={`Fond de caisse initial — ${startTarget.nom}`}
          description="Comptez le fond de caisse de départ avant d'ouvrir la buvette/boutique."
          coupuresActives={config.coupuresActives}
          onSubmit={handleStart}
        />
      )}

      {endTarget && (
        <FondCaisseDialog
          open={!!endTarget}
          onOpenChange={(o) => !o && setEndTarget(null)}
          title={`Recomptage de fin — ${endTarget.nom}`}
          description="Recomptez la caisse à la fin du match."
          coupuresActives={config.coupuresActives}
          expectedTotal={expectedTotalForEnd(endTarget)}
          onSubmit={handleEnd}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer "{deleteTarget?.nom}" ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteMatch(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
