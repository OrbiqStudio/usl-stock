import { useNavigate, useParams } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { DossierIcon } from "@/components/DossierIcon";
import { useActiveMatch, useDossiers, useArticlesBySection } from "@/hooks/useData";
import type { Section } from "@/types";

export default function StockMatchDossiersScreen() {
  const navigate = useNavigate();
  const { section } = useParams<{ section: Section }>();
  const sec = (section as Section) ?? "boutique";
  const activeMatch = useActiveMatch();
  const dossiers = useDossiers(sec);
  const articles = useArticlesBySection(sec);

  if (!activeMatch) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-usl-gray text-center">
        <h2 className="text-2xl font-bold">Aucun match en cours</h2>
        <button onClick={() => navigate(`/gestion/${sec}`)} className="text-primary underline">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-usl-gray">
      <ScreenHeader
        title={`Stock — ${activeMatch.nom}`}
        subtitle={sec === "boutique" ? "Boutique" : "Buvette / Bar"}
        onBack={() => navigate(`/gestion/${sec}`)}
      />

      <div className="flex-1 overflow-y-auto p-6">
        {dossiers.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <FolderOpen className="h-12 w-12 opacity-40" />
            <p className="text-lg">Aucun dossier</p>
            <p className="text-sm">
              Crée d'abord tes articles depuis "Produits globaux"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {dossiers.map((d) => {
              const count = articles.filter((a) => a.dossierId === d.id).length;
              return (
                <button
                  key={d.id}
                  onClick={() => navigate(`/gestion/${sec}/stock/${d.id}`)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-usl-warning-light text-usl-warning">
                    <DossierIcon value={d.icone} className="h-7 w-7" />
                  </div>
                  <span className="text-center text-lg font-bold">{d.nom}</span>
                  <span className="text-sm text-muted-foreground">
                    {count} article{count > 1 ? "s" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
