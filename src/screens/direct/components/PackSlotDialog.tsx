import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatEuros } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Pack, PackSlotOption } from "@/types";

export function PackSlotDialog({
  pack,
  onOpenChange,
  onConfirm,
}: {
  pack: Pack | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (choix: PackSlotOption[]) => void;
}) {
  const [choix, setChoix] = useState<Record<string, PackSlotOption>>({});

  useEffect(() => {
    setChoix({});
  }, [pack]);

  if (!pack) return null;

  const total = pack.prixPack + Object.values(choix).reduce((s, o) => s + o.prixDelta, 0);
  const complet = pack.slots.every((s) => choix[s.id]);

  function select(slotId: string, option: PackSlotOption) {
    setChoix((prev) => ({ ...prev, [slotId]: option }));
  }

  function confirm() {
    if (!complet) return;
    onConfirm(Object.values(choix));
  }

  return (
    <Dialog open={!!pack} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{pack.nom}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {pack.slots.map((slot) => (
            <div key={slot.id} className="flex flex-col gap-2">
              <span className="text-sm font-bold">{slot.label}</span>
              <div className="grid grid-cols-2 gap-2">
                {slot.options.map((o) => {
                  const active = choix[slot.id]?.articleId === o.articleId;
                  return (
                    <button
                      key={o.articleId}
                      onClick={() => select(slot.id, o)}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 text-left font-semibold transition-colors",
                        active
                          ? "border-primary bg-usl-blue-light text-primary"
                          : "border-border hover:border-primary"
                      )}
                    >
                      <span className="truncate">{o.articleNom}</span>
                      {o.prixDelta !== 0 && (
                        <span className="flex-shrink-0 text-xs">
                          {o.prixDelta > 0 ? "+" : ""}
                          {formatEuros(o.prixDelta)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-xl bg-usl-gray px-4 py-3">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-extrabold text-primary">{formatEuros(total)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button disabled={!complet} onClick={confirm}>
            Ajouter au panier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
