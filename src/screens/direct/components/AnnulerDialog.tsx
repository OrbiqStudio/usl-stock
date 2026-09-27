import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MOTIFS = ["Erreur de saisie", "Client parti", "Autre"] as const;

export function AnnulerDialog({
  open,
  onOpenChange,
  numero,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  numero?: number;
  onConfirm: (motif: string) => void;
}) {
  const [motif, setMotif] = useState<(typeof MOTIFS)[number]>("Erreur de saisie");
  const [autre, setAutre] = useState("");

  useEffect(() => {
    if (open) {
      setMotif("Erreur de saisie");
      setAutre("");
    }
  }, [open]);

  function handleConfirm() {
    const finalMotif = motif === "Autre" ? autre.trim() || "Autre" : motif;
    onConfirm(finalMotif);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Annuler la commande n°{numero} ?</DialogTitle>
          <DialogDescription>Indiquez le motif de l'annulation.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {MOTIFS.map((m) => (
            <button
              key={m}
              onClick={() => setMotif(m)}
              className={cn(
                "rounded-lg border-2 px-4 py-3 text-left font-semibold",
                motif === m ? "border-primary bg-usl-blue-light text-primary" : "border-border"
              )}
            >
              {m}
            </button>
          ))}
          {motif === "Autre" && (
            <Input
              autoFocus
              placeholder="Précisez le motif…"
              value={autre}
              onChange={(e) => setAutre(e.target.value)}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Retour
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirmer l'annulation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
