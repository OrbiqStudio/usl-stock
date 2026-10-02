import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Settings2, ClipboardList } from "lucide-react";
import { useActiveMatch } from "@/hooks/useData";
import type { Section } from "@/types";

export default function StockModeScreen() {
  const navigate = useNavigate();
  const { section } = useParams<{ section: Section }>();
  const sec = (section as Section) ?? "boutique";
  const activeMatch = useActiveMatch();

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-white px-8">
      <button
        onClick={() => navigate("/gestion")}
        className="absolute left-8 top-8 flex h-12 w-12 items-center justify-center rounded-full text-usl-gray-dark transition-colors hover:bg-usl-gray hover:text-primary"
        aria-label="Retour"
      >
        <ArrowLeft strokeWidth={1.5} className="h-6 w-6" />
      </button>

      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {sec === "boutique" ? "Boutique" : "Buvette / Bar"}
        </h1>
        <p className="mt-1.5 text-base text-muted-foreground">Gestion des stocks</p>
      </div>

      <div className="mt-20 grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
        <button
          onClick={() => navigate(`/gestion/${sec}/produits`)}
          className="flex flex-col items-center gap-4 rounded-2xl bg-primary px-8 py-12 text-primary-foreground transition-opacity active:opacity-90"
        >
          <Settings2 strokeWidth={1.5} className="h-9 w-9" />
          <div className="text-center">
            <div className="text-lg font-semibold">Produits globaux</div>
            <div className="mt-0.5 text-sm text-primary-foreground/70">
              Articles et packs, une seule fois
            </div>
          </div>
        </button>

        <button
          onClick={() => activeMatch && navigate(`/gestion/${sec}/stock`)}
          disabled={!activeMatch}
          className="flex flex-col items-center gap-4 rounded-2xl border-2 border-primary bg-white px-8 py-12 text-primary transition-colors active:bg-usl-gray disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground"
        >
          <ClipboardList strokeWidth={1.5} className="h-9 w-9" />
          <div className="text-center">
            <div className="text-lg font-semibold">
              {activeMatch ? `Stock — ${activeMatch.nom}` : "Aucun match en cours"}
            </div>
            <div className="mt-0.5 text-sm opacity-70">
              {activeMatch ? "Quantités disponibles pour ce match" : "Démarre un match depuis l'Admin"}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
