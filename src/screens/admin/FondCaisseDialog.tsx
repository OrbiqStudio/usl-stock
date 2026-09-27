import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COUPURES_LABELS, COUPURES_VALEURS, type CoupureCle, type FondCaisse } from "@/types";
import { formatEuros } from "@/lib/money";
import { cn } from "@/lib/utils";

export function FondCaisseDialog({
  open,
  onOpenChange,
  title,
  description,
  coupuresActives,
  expectedTotal,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  coupuresActives: CoupureCle[];
  expectedTotal?: number;
  onSubmit: (fond: FondCaisse, total: number) => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) setQuantities({});
  }, [open]);

  const total = useMemo(() => {
    return coupuresActives.reduce((sum, c) => {
      const qty = parseInt(quantities[c] || "0", 10) || 0;
      return sum + qty * COUPURES_VALEURS[c];
    }, 0);
  }, [quantities, coupuresActives]);

  const ecart = expectedTotal != null ? total - expectedTotal : null;

  function handleSubmit() {
    const fond: FondCaisse = {};
    coupuresActives.forEach((c) => {
      fond[c] = parseInt(quantities[c] || "0", 10) || 0;
    });
    onSubmit(fond, total);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
          {coupuresActives.map((c) => (
            <div key={c} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">
                {COUPURES_LABELS[c]}
              </label>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={quantities[c] ?? ""}
                onChange={(e) => setQuantities((q) => ({ ...q, [c]: e.target.value }))}
                placeholder="0"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-usl-gray p-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total compté</span>
            <span>{formatEuros(total)}</span>
          </div>
          {ecart !== null && (
            <div
              className={cn(
                "flex justify-between rounded-lg px-3 py-2 text-sm font-bold",
                ecart === 0 ? "bg-usl-success-light text-success" : "bg-usl-danger-light text-destructive"
              )}
            >
              <span>Fond théorique attendu : {formatEuros(expectedTotal!)}</span>
              <span>
                Écart : {ecart > 0 ? "+" : ""}
                {formatEuros(ecart)}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Valider</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
