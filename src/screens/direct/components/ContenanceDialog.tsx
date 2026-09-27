import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CONTENANCES, type Article, type Contenance } from "@/types";
import { formatEuros } from "@/lib/money";

export function ContenanceDialog({
  article,
  onOpenChange,
  onChoose,
}: {
  article: Article | null;
  onOpenChange: (open: boolean) => void;
  onChoose: (contenance: Contenance) => void;
}) {
  const disponibles = article ? CONTENANCES.filter((c) => article.contenances[c] != null) : [];

  return (
    <Dialog open={!!article} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{article?.nom} — quelle contenance ?</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3">
          {disponibles.map((c) => (
            <button
              key={c}
              onClick={() => article && onChoose(c)}
              className="flex items-center justify-between rounded-xl border-2 border-border px-5 py-4 text-left font-bold transition-colors hover:border-primary hover:bg-usl-blue-light hover:text-primary"
            >
              <span className="text-lg">{c}</span>
              <span className="text-lg text-primary">{formatEuros(article!.contenances[c]!)}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
