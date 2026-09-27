import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Remise } from "@/types";

export function RemiseDialog({
  open,
  onOpenChange,
  current,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: Remise | null;
  onApply: (remise: Remise | null) => void;
}) {
  const [type, setType] = useState<"pourcentage" | "montant">("pourcentage");
  const [valeur, setValeur] = useState("");

  useEffect(() => {
    if (open) {
      setType(current?.type ?? "pourcentage");
      setValeur(current ? String(current.valeur) : "");
    }
  }, [open, current]);

  function handleApply() {
    const v = parseFloat(valeur.replace(",", "."));
    if (!v || v <= 0) {
      onApply(null);
    } else {
      onApply({ type, valeur: type === "montant" ? Math.round(v * 100) : v });
    }
    onOpenChange(false);
  }

  function handleRemove() {
    onApply(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remise</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setType("pourcentage")}
              className={cn(
                "flex-1 rounded-lg border-2 py-3 font-bold",
                type === "pourcentage" ? "border-primary bg-usl-blue-light text-primary" : "border-border"
              )}
            >
              Pourcentage %
            </button>
            <button
              onClick={() => setType("montant")}
              className={cn(
                "flex-1 rounded-lg border-2 py-3 font-bold",
                type === "montant" ? "border-primary bg-usl-blue-light text-primary" : "border-border"
              )}
            >
              Montant €
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{type === "pourcentage" ? "Pourcentage de remise" : "Montant de la remise"}</Label>
            <Input
              inputMode="decimal"
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
              placeholder={type === "pourcentage" ? "Ex : 10" : "Ex : 5,00"}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="justify-between sm:justify-between">
          {current && (
            <Button variant="ghost" className="text-destructive" onClick={handleRemove}>
              Retirer la remise
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleApply}>Appliquer</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
