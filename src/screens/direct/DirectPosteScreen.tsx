import { useNavigate } from "react-router-dom";
import { ShoppingBag, UtensilsCrossed, TriangleAlert } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useActiveMatch } from "@/hooks/useData";
import { TYPE_MATCH_LABELS } from "@/types";

export default function DirectPosteScreen() {
  const navigate = useNavigate();
  const activeMatch = useActiveMatch();

  return (
    <div className="flex h-screen w-screen flex-col bg-white">
      <ScreenHeader title="En direct" onBack={() => navigate("/")} />

      {!activeMatch ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <TriangleAlert strokeWidth={1.5} className="h-14 w-14 text-usl-warning" />
          <h2 className="text-2xl font-bold">Aucun événement en cours</h2>
          <p className="max-w-md text-muted-foreground">
            Demandez à un administrateur de démarrer un match depuis le panneau Admin avant de
            pouvoir prendre des commandes.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-10 px-8">
          <div className="rounded-2xl border border-border bg-white px-6 py-4 text-center">
            <div className="text-sm font-semibold uppercase tracking-wide text-usl-success">
              ● Match en cours
            </div>
            <div className="text-xl font-bold">{activeMatch.nom}</div>
            <div className="text-sm text-muted-foreground">{TYPE_MATCH_LABELS[activeMatch.type]}</div>
          </div>

          <div className="grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
            <button
              onClick={() => navigate("/direct/boutique")}
              className="flex flex-col items-center gap-4 rounded-2xl bg-primary px-8 py-12 text-primary-foreground transition-opacity active:opacity-90"
            >
              <ShoppingBag strokeWidth={1.5} className="h-9 w-9" />
              <div className="text-lg font-semibold">Boutique</div>
            </button>
            <button
              onClick={() => navigate("/direct/buvette")}
              className="flex flex-col items-center gap-4 rounded-2xl border-2 border-primary bg-white px-8 py-12 text-primary transition-colors active:bg-usl-gray"
            >
              <UtensilsCrossed strokeWidth={1.5} className="h-9 w-9" />
              <div className="text-lg font-semibold">Bar / Restauration</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
