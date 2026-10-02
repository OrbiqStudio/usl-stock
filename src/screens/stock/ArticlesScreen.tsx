import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Package, Star, Beer } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useArticles, useDossiers } from "@/hooks/useData";
import { ArticleFormDialog } from "@/screens/stock/ArticleFormDialog";
import { formatEuros } from "@/lib/money";
import type { Article, Section } from "@/types";

export default function ArticlesScreen() {
  const navigate = useNavigate();
  const { section, dossierId } = useParams<{ section: Section; dossierId: string }>();
  const sec = (section as Section) ?? "boutique";
  const dossiers = useDossiers(sec);
  const dossier = dossiers.find((d) => d.id === dossierId);
  const articles = useArticles(dossierId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(a: Article) {
    setEditing(a);
    setFormOpen(true);
  }

  return (
    <div className="relative flex h-screen w-screen flex-col bg-white">
      <ScreenHeader
        title={dossier ? dossier.nom : "Articles"}
        subtitle={sec === "boutique" ? "Boutique" : "Buvette / Bar"}
        onBack={() => navigate(`/gestion/${sec}/produits`)}
      />

      <div className="flex-1 overflow-y-auto px-6 pb-24 pt-2">
        {articles.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <Package strokeWidth={1.5} className="h-12 w-12 opacity-40" />
            <p className="text-lg">Aucun article dans ce dossier</p>
            <p className="text-sm">Ajoute ton premier article avec le bouton +</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {articles.map((a) => (
              <button
                key={a.id}
                onClick={() => openEdit(a)}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white text-left transition-colors hover:border-primary"
              >
                <div className="flex h-32 items-center justify-center bg-usl-gray">
                  {a.imageUrl ? (
                    <img src={a.imageUrl} alt={a.nom} className="h-full w-full object-cover" />
                  ) : (
                    <Package strokeWidth={1.5} className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-center gap-1.5 truncate text-base font-bold">
                    {a.favori && <Star className="h-4 w-4 flex-shrink-0 fill-usl-warning text-usl-warning" />}
                    <span className="truncate">{a.nom}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">TVA {a.tauxTVA}%</span>
                    {a.estAlcool ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-primary">
                        <Beer strokeWidth={1.75} className="h-3.5 w-3.5" />
                        {Object.keys(a.contenances).length} format
                        {Object.keys(a.contenances).length > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-lg font-extrabold text-primary">
                        {formatEuros(a.prixVente)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={openCreate}
        className="absolute bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity active:opacity-90"
        aria-label="Créer un article"
      >
        <Plus strokeWidth={1.75} className="h-6 w-6" />
      </button>

      {dossierId && (
        <ArticleFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          section={sec}
          dossierId={dossierId}
          article={editing}
        />
      )}
    </div>
  );
}
