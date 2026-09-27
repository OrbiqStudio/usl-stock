import { Search, Package, Package2, Star, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Article, Pack } from "@/types";
import { formatEuros } from "@/lib/money";
import { cn } from "@/lib/utils";

export function ArticleGrid({
  mode,
  articles,
  packs,
  quantities,
  search,
  onSearchChange,
  onSelectArticle,
  onDecrementArticle,
  onSelectPack,
}: {
  mode: "articles" | "packs";
  articles: Article[];
  packs: Pack[];
  quantities: Record<string, number>;
  search: string;
  onSearchChange: (v: string) => void;
  onSelectArticle: (a: Article) => void;
  onDecrementArticle: (a: Article) => void;
  onSelectPack: (p: Pack) => void;
}) {
  const filteredArticles = articles.filter((a) =>
    a.nom.toLowerCase().includes(search.toLowerCase())
  );
  const filteredPacks = packs.filter((p) => p.nom.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-white">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un article…"
            className="rounded-xl pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {mode === "packs" ? (
          filteredPacks.length === 0 ? (
            <EmptyState icon={<Package2 className="h-10 w-10" />} text="Aucun pack disponible" />
          ) : (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {filteredPacks.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPack(p)}
                  className="flex flex-col overflow-hidden rounded-2xl border-2 border-transparent bg-white text-left shadow-sm transition-all active:scale-[0.98]"
                >
                  <div className="flex h-24 items-center justify-center bg-usl-blue-light text-primary">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.nom} className="h-full w-full object-cover" />
                    ) : (
                      <Package2 className="h-9 w-9" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <span className="line-clamp-2 text-sm font-bold leading-tight">{p.nom}</span>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {p.articles.map((a) => `${a.quantite}× ${a.articleNom}`).join(", ")}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <span className="text-lg font-extrabold text-primary">{formatEuros(p.prixPack)}</span>
                      <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                        Ajouter
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : filteredArticles.length === 0 ? (
          <EmptyState icon={<Package className="h-10 w-10" />} text="Aucun article ici" />
        ) : (
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            {filteredArticles.map((a) => {
              const qty = quantities[a.id] ?? 0;
              const rupture = a.stock <= 0;
              const atMax = qty >= a.stock;
              const stockBas = !rupture && a.stock <= a.seuilAlerte;
              const selected = qty > 0;
              return (
                <div
                  key={a.id}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all",
                    selected ? "border-primary" : "border-transparent",
                    rupture && "opacity-40"
                  )}
                >
                  <button
                    type="button"
                    disabled={rupture || atMax}
                    onClick={() => onSelectArticle(a)}
                    className="relative flex h-24 w-full items-center justify-center overflow-hidden bg-usl-gray disabled:cursor-not-allowed"
                  >
                    {a.imageUrl ? (
                      <img src={a.imageUrl} alt={a.nom} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                    {a.favori && (
                      <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                        <Star className="h-3.5 w-3.5 fill-usl-warning text-usl-warning" />
                      </span>
                    )}
                    {stockBas && (
                      <span className="absolute right-2 top-2 rounded-full bg-usl-danger px-2 py-0.5 text-[10px] font-bold text-white">
                        {a.stock} restant{a.stock > 1 ? "s" : ""}
                      </span>
                    )}
                    {rupture && (
                      <span className="absolute right-2 top-2 rounded-full bg-usl-gray-dark px-2 py-0.5 text-[10px] font-bold text-white">
                        Rupture
                      </span>
                    )}
                  </button>

                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <span className="line-clamp-2 text-sm font-bold leading-tight">{a.nom}</span>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <span className="text-lg font-extrabold text-primary">
                        {a.estAlcool ? (
                          <>
                            <span className="text-xs font-semibold text-muted-foreground">dès </span>
                            {formatEuros(Math.min(...Object.values(a.contenances) as number[]))}
                          </>
                        ) : (
                          formatEuros(a.prixVente)
                        )}
                      </span>
                      {selected && !a.estAlcool ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onDecrementArticle(a)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-usl-gray text-foreground hover:bg-slate-200"
                            aria-label={`Retirer un ${a.nom}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-5 text-center text-sm font-extrabold">{qty}</span>
                          <button
                            onClick={() => onSelectArticle(a)}
                            disabled={atMax}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Ajouter un ${a.nom}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onSelectArticle(a)}
                          disabled={rupture || atMax}
                          className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {a.estAlcool ? "Choisir" : "Ajouter"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
      {icon}
      <p>{text}</p>
    </div>
  );
}
