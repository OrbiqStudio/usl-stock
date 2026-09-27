import { useNavigate, useParams } from "react-router-dom";
import { Settings2, ClipboardList } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useActiveMatch } from "@/hooks/useData";
import type { Section } from "@/types";

export default function StockModeScreen() {
  const navigate = useNavigate();
  const { section } = useParams<{ section: Section }>();
  const sec = (section as Section) ?? "boutique";
  const activeMatch = useActiveMatch();

  return (
    <div className="flex h-screen w-screen flex-col bg-usl-gray">
      <ScreenHeader
        title={sec === "boutique" ? "Boutique" : "Buvette / Bar"}
        subtitle="Gestion des stocks"
        onBack={() => navigate("/gestion")}
      />
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <button
            onClick={() => navigate(`/gestion/${sec}/produits`)}
            className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-usl-blue-light text-primary">
              <Settings2 className="h-10 w-10" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">Produits globaux</div>
              <div className="text-sm text-muted-foreground">
                Créer / modifier les articles et les packs (une seule fois)
              </div>
            </div>
          </button>

          <button
            onClick={() => activeMatch && navigate(`/gestion/${sec}/stock`)}
            disabled={!activeMatch}
            className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-usl-warning-light text-usl-warning">
              <ClipboardList className="h-10 w-10" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                {activeMatch ? `Stock — ${activeMatch.nom}` : "Aucun match en cours"}
              </div>
              <div className="text-sm text-muted-foreground">
                {activeMatch
                  ? "Renseigner les quantités disponibles pour ce match"
                  : "Démarre un match depuis l'Admin pour saisir son stock"}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
