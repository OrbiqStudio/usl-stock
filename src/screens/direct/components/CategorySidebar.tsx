import { Star, Package2 } from "lucide-react";
import { DossierIcon } from "@/components/DossierIcon";
import { cn } from "@/lib/utils";
import type { Article, Dossier, Pack } from "@/types";

export type CategoryKey = "favoris" | "packs" | (string & {});

export function CategorySidebar({
  dossiers,
  articles,
  packs,
  favoris,
  selected,
  onSelect,
}: {
  dossiers: Dossier[];
  articles: Article[];
  packs: Pack[];
  favoris: Article[];
  selected: CategoryKey;
  onSelect: (key: CategoryKey) => void;
}) {
  return (
    <div className="flex w-full flex-shrink-0 gap-3 overflow-x-auto rounded-2xl border border-border bg-white p-3 no-scrollbar">
      <CategoryPill
        active={selected === "favoris"}
        onClick={() => onSelect("favoris")}
        icon={<Star className="h-5 w-5" />}
        label="Favoris"
        count={favoris.length}
      />
      <CategoryPill
        active={selected === "packs"}
        onClick={() => onSelect("packs")}
        icon={<Package2 className="h-5 w-5" />}
        label="Packs"
        count={packs.length}
      />
      <div className="my-1 w-px flex-shrink-0 bg-border" />
      {dossiers.map((d) => (
        <CategoryPill
          key={d.id}
          active={selected === d.id}
          onClick={() => onSelect(d.id)}
          icon={<DossierIcon value={d.icone} className="h-5 w-5" />}
          label={d.nom}
          count={articles.filter((a) => a.dossierId === d.id).length}
        />
      ))}
    </div>
  );
}

function CategoryPill({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-w-[92px] flex-shrink-0 flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-2.5 text-center transition-colors",
        active ? "border-primary bg-usl-blue-light" : "border-transparent hover:bg-usl-gray"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
          active ? "bg-primary text-primary-foreground" : "bg-usl-gray text-usl-gray-dark"
        )}
      >
        {icon}
      </div>
      <span className={cn("line-clamp-1 text-xs font-bold leading-tight", active && "text-primary")}>
        {label}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {count} article{count > 1 ? "s" : ""}
      </span>
    </button>
  );
}
