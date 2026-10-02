import {
  Minus,
  Plus,
  Trash2,
  Tag,
  ShoppingCart,
  Banknote,
  CreditCard,
  FileText,
  MoreHorizontal,
  PackageCheck,
  PackageMinus,
} from "lucide-react";
import type { Commande, MoyenPaiement } from "@/types";
import { formatEuros } from "@/lib/money";

const PAYMENT_ICONS: { key: MoyenPaiement; label: string; icon: React.ReactNode }[] = [
  { key: "especes", label: "Espèces", icon: <Banknote className="h-5 w-5" /> },
  { key: "cb", label: "Carte", icon: <CreditCard className="h-5 w-5" /> },
  { key: "cheque", label: "Chèque", icon: <FileText className="h-5 w-5" /> },
  { key: "autre", label: "Autre", icon: <MoreHorizontal className="h-5 w-5" /> },
];

export function CommandeRecap({
  commande,
  onIncrement,
  onDecrement,
  onRemove,
  onOpenRemise,
  onQuickPay,
  onAddConsigne,
  onRemoveConsigne,
}: {
  commande?: Commande;
  onIncrement: (index: number) => void;
  onDecrement: (index: number) => void;
  onRemove: (index: number) => void;
  onOpenRemise: () => void;
  onQuickPay: (moyen: MoyenPaiement) => void;
  onAddConsigne: () => void;
  onRemoveConsigne: () => void;
}) {
  if (!commande) {
    return (
      <div className="flex w-[340px] flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-white text-muted-foreground">
        Chargement…
      </div>
    );
  }

  const canPay = commande.lignes.length > 0;

  return (
    <div className="flex h-full w-[340px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-white">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-extrabold">Commande n°{commande.numero}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {commande.lignes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 opacity-40" />
            <p className="text-sm">Sélectionnez des articles</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {commande.lignes.map((ligne, i) => (
              <div
                key={`${ligne.articleId}-${i}`}
                className="flex items-center gap-2 rounded-xl bg-usl-gray p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{ligne.articleNom}</div>
                  <div className="text-xs text-muted-foreground">{formatEuros(ligne.prixUnitaire)} / u</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDecrement(i)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white hover:bg-slate-200"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{ligne.quantite}</span>
                  <button
                    onClick={() => onIncrement(i)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white hover:bg-slate-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="w-16 text-right text-sm font-bold">{formatEuros(ligne.sousTotal)}</div>
                <button
                  onClick={() => onRemove(i)}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-usl-danger-light hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-5 py-4">
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            onClick={onOpenRemise}
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <Tag className="h-4 w-4" />
            {commande.remise ? "Modifier la remise" : "Ajouter une remise"}
          </button>
          <button
            onClick={onAddConsigne}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <PackageCheck className="h-4 w-4" /> Consigne
          </button>
          <button
            onClick={onRemoveConsigne}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-destructive hover:underline"
          >
            <PackageMinus className="h-4 w-4" /> Déconsigne
          </button>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Sous-total HT</span>
            <span>{formatEuros(commande.totalHT)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>TVA</span>
            <span>{formatEuros(commande.totalTVA)}</span>
          </div>
          {commande.remise && commande.montantRemise > 0 && (
            <div className="flex justify-between text-destructive">
              <span>
                Remise {commande.remise.type === "pourcentage" ? `(${commande.remise.valeur}%)` : ""}
              </span>
              <span>−{formatEuros(commande.montantRemise)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-xl font-extrabold">
            <span>TOTAL TTC</span>
            <span className="text-primary">{formatEuros(commande.totalTTC)}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {PAYMENT_ICONS.map((m) => (
            <button
              key={m.key}
              onClick={() => canPay && onQuickPay(m.key)}
              disabled={!canPay}
              className="flex flex-col items-center gap-1 rounded-xl border-2 border-border py-2.5 text-primary transition-colors hover:border-primary hover:bg-usl-blue-light disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent"
              title={m.label}
              aria-label={`Encaisser en ${m.label.toLowerCase()}`}
            >
              {m.icon}
              <span className="text-[10px] font-bold leading-none">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
