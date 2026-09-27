import { ShoppingCart, Wallet, XCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Commande, Match } from "@/types";
import { TYPE_MATCH_LABELS } from "@/types";

export function CaisseSidebar({
  match,
  commande,
  onNouvelle,
  onEncaisser,
  onAnnuler,
  onHome,
}: {
  match: Match;
  commande?: Commande;
  onNouvelle: () => void;
  onEncaisser: () => void;
  onAnnuler: () => void;
  onHome: () => void;
}) {
  return (
    <div className="flex h-full w-56 flex-shrink-0 flex-col gap-4 rounded-2xl border border-border bg-white p-4">
      <div className="rounded-xl bg-usl-blue-light p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-primary">
          {TYPE_MATCH_LABELS[match.type]}
        </div>
        <div className="text-lg font-bold leading-tight text-primary">{match.nom}</div>
      </div>

      {commande && (
        <div className="rounded-xl border border-border p-4 text-center">
          <div className="text-sm text-muted-foreground">Commande</div>
          <div className="text-3xl font-extrabold text-primary">n°{commande.numero}</div>
        </div>
      )}

      <div className="mt-2 flex flex-col gap-2">
        <Button onClick={onNouvelle} variant="secondary" className="justify-start" size="lg">
          <ShoppingCart className="h-5 w-5" /> Nouvelle commande
        </Button>
        <Button
          onClick={onEncaisser}
          variant="success"
          className="justify-start"
          size="lg"
          disabled={!commande || commande.lignes.length === 0}
        >
          <Wallet className="h-5 w-5" /> Encaisser
        </Button>
        <Button
          onClick={onAnnuler}
          variant="ghost"
          className="justify-start text-destructive hover:bg-usl-danger-light"
          size="lg"
          disabled={!commande || commande.lignes.length === 0}
        >
          <XCircle className="h-5 w-5" /> Annuler commande
        </Button>
      </div>

      <div className="flex-1" />

      <Button onClick={onHome} variant="ghost" className="justify-start">
        <Home className="h-5 w-5" /> Retour à l'accueil
      </Button>
    </div>
  );
}
