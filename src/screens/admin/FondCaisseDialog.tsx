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
import { COUPURES_LABELS, COUPURES_VALEURS, type CoupureCle, type FondCaisse, type Section } from "@/types";
import { formatEuros } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Couleurs distinctes par caisse pour éviter de confondre buvette et boutique. */
const SECTION_STYLE: Record<Section, { label: string; banner: string; ring: string; text: string; button: string }> = {
  buvette: {
    label: "BUVETTE",
    banner: "bg-orange-500 text-white",
    ring: "border-orange-500",
    text: "text-orange-600",
    button: "bg-orange-500 text-white hover:bg-orange-600",
  },
  boutique: {
    label: "BOUTIQUE",
    banner: "bg-violet-600 text-white",
    ring: "border-violet-600",
    text: "text-violet-700",
    button: "bg-violet-600 text-white hover:bg-violet-700",
  },
};

export function FondCaisseDialog({
  open,
  onOpenChange,
  title,
  description,
  coupuresActives,
  expectedTotal,
  section,
  phase,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  coupuresActives: CoupureCle[];
  expectedTotal?: number;
  section: Section;
  phase: "initial" | "final";
  onSubmit: (fond: FondCaisse, total: number) => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const [confirming, setConfirming] = useState(false);
  const style = SECTION_STYLE[section];
  const phaseLabel = phase === "initial" ? "Fond de caisse de DÉBUT" : "Fond de caisse de FIN";

  useEffect(() => {
    if (open) {
      setQuantities({});
      setConfirming(false);
    }
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
    setConfirming(false);
    onSubmit(fond, total);
  }

  const ecartBlock =
    ecart !== null ? (
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
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-2xl border-4", style.ring)}>
        <div className={cn("-mx-6 -mt-6 rounded-t-xl px-6 py-4 text-center", style.banner)}>
          <div className="text-sm font-semibold tracking-wide opacity-90">{phaseLabel}</div>
          <div className="text-3xl font-extrabold tracking-widest">{style.label}</div>
        </div>

        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {confirming ? (
          <>
            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center">
              <div className="text-sm font-semibold text-muted-foreground">
                Vous allez valider le {phaseLabel.toLowerCase()} de la
              </div>
              <div className={cn("text-3xl font-extrabold tracking-widest", style.text)}>{style.label}</div>
              <div className="mt-2 text-4xl font-extrabold">{formatEuros(total)}</div>
              <div className="text-sm text-muted-foreground">Est-ce bien le montant compté dans la caisse de la {style.label.toLowerCase()} ?</div>
            </div>
            {ecartBlock}
            <DialogFooter>
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                Non, modifier
              </Button>
              <Button className={style.button} onClick={handleSubmit}>
                Oui, valider la {style.label.toLowerCase()}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
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
              {ecartBlock}
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button className={style.button} onClick={() => setConfirming(true)}>
                Valider
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
