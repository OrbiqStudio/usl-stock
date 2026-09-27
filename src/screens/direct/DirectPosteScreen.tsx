import { useNavigate } from "react-router-dom";
import { ShoppingBag, UtensilsCrossed, TriangleAlert } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useActiveMatch } from "@/hooks/useData";
import { TYPE_MATCH_LABELS } from "@/types";

export default function DirectPosteScreen() {
  const navigate = useNavigate();
  const activeMatch = useActiveMatch();

  return (
    <div className="flex h-screen w-screen flex-col bg-usl-gray">
      <ScreenHeader title="En direct" onBack={() => navigate("/")} />

      {!activeMatch ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <TriangleAlert className="h-14 w-14 text-usl-warning" />
          <h2 className="text-2xl font-bold">Aucun événement en cours</h2>
          <p className="max-w-md text-muted-foreground">
            Demandez à un administrateur de démarrer un match depuis le panneau Admin avant de
            pouvoir prendre des commandes.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8">
          <div className="rounded-2xl border border-border bg-white px-6 py-4 text-center shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-wide text-usl-success">
              ● Match en cours
            </div>
            <div className="text-xl font-bold">{activeMatch.nom}</div>
            <div className="text-sm text-muted-foreground">{TYPE_MATCH_LABELS[activeMatch.type]}</div>
          </div>

          <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            <button
              onClick={() => navigate("/direct/boutique")}
              className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-usl-blue-light text-primary">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <div className="text-xl font-bold">Boutique</div>
            </button>
            <button
              onClick={() => navigate("/direct/buvette")}
              className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-usl-warning-light text-usl-warning">
                <UtensilsCrossed className="h-10 w-10" />
              </div>
              <div className="text-xl font-bold">Bar / Restauration</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
