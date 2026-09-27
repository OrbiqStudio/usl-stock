import { useEffect, useState } from "react";
import { Banknote, CreditCard, FileText, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatEuros } from "@/lib/money";
import { playConfirmDing } from "@/lib/sound";
import type { Commande, MoyenPaiement } from "@/types";

type Step = "moyen" | "detail" | "compteur" | "pret";

const MOYENS: { key: MoyenPaiement; label: string; icon: React.ReactNode }[] = [
  { key: "especes", label: "Espèces", icon: <Banknote className="h-8 w-8" /> },
  { key: "cb", label: "Carte bancaire", icon: <CreditCard className="h-8 w-8" /> },
  { key: "cheque", label: "Chèque", icon: <FileText className="h-8 w-8" /> },
  { key: "autre", label: "Autre", icon: <MoreHorizontal className="h-8 w-8" /> },
];

const COUNTDOWN_MS = 1000;

export function EncaissementDialog({
  open,
  onOpenChange,
  commande,
  initialMoyen,
  onConfirmed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commande?: Commande;
  initialMoyen?: MoyenPaiement | null;
  onConfirmed: (moyenPaiement: MoyenPaiement, montantRecu: number | null) => void;
}) {
  const [step, setStep] = useState<Step>("moyen");
  const [moyen, setMoyen] = useState<MoyenPaiement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open) {
      if (initialMoyen) {
        setStep("detail");
        setMoyen(initialMoyen);
      } else {
        setStep("moyen");
        setMoyen(null);
      }
      setProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMoyen]);

  useEffect(() => {
    if (step !== "compteur") return;
    const start = Date.now();
    const interval = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / COUNTDOWN_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setStep("pret");
        playConfirmDing();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [step]);

  if (!commande) return null;

  function handleChooseMoyen(m: MoyenPaiement) {
    setMoyen(m);
    setStep("detail");
  }

  function handleValider() {
    setStep("compteur");
  }

  function handleConfirmerPaye() {
    if (!moyen) return;
    onConfirmed(moyen, null);
  }

  return (
    <Dialog open={open} onOpenChange={step === "moyen" ? onOpenChange : undefined}>
      <DialogContent
        hideClose={step !== "moyen"}
        className="max-w-lg"
        onPointerDownOutside={(e) => step !== "moyen" && e.preventDefault()}
        onEscapeKeyDown={(e) => step !== "moyen" && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Encaissement — Commande n°{commande.numero}</DialogTitle>
        </DialogHeader>

        {step === "moyen" && (
          <div className="flex flex-col gap-4">
            <div className="text-center text-3xl font-extrabold text-primary">
              {formatEuros(commande.totalTTC)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOYENS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => handleChooseMoyen(m.key)}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-border p-6 font-bold hover:border-primary hover:bg-usl-blue-light hover:text-primary"
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "detail" && moyen && (
          <div className="flex flex-col gap-4">
            <div className="text-center text-3xl font-extrabold text-primary">
              {formatEuros(commande.totalTTC)}
            </div>
            <p className="text-center text-muted-foreground">Total à payer</p>
            <Button size="xl" onClick={handleValider}>
              Valider le paiement
            </Button>
          </div>
        )}

        {step === "compteur" && (
          <div className="flex flex-col items-center gap-6 py-6">
            <p className="text-xl font-semibold">Paiement en cours d'encaissement…</p>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {step === "pret" && (
          <div className="flex flex-col items-center gap-6 py-4">
            <CheckCircle2 className="h-16 w-16 text-success" />
            <Button
              size="xl"
              variant="success"
              className="w-full text-2xl"
              onClick={handleConfirmerPaye}
            >
              ✅ Commande payée
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
