import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useArticlesBySection } from "@/hooks/useData";
import { createPack, updatePack } from "@/lib/data";
import { eurosToCents, centsToEuros } from "@/lib/money";
import type { Pack, PackArticle, Section } from "@/types";
import { toast } from "sonner";

export function PackFormDialog({
  open,
  onOpenChange,
  section,
  pack,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section;
  pack?: Pack | null;
}) {
  const articles = useArticlesBySection(section);
  const [nom, setNom] = useState("");
  const [prixPack, setPrixPack] = useState("");
  const [tauxTVA, setTauxTVA] = useState<"5.5" | "10" | "20">("20");
  const [selected, setSelected] = useState<PackArticle[]>([]);

  useEffect(() => {
    if (open) {
      setNom(pack?.nom ?? "");
      setPrixPack(pack ? String(centsToEuros(pack.prixPack)) : "");
      setTauxTVA(pack ? (String(pack.tauxTVA) as "5.5" | "10" | "20") : "20");
      setSelected(pack?.articles ?? []);
    }
  }, [open, pack]);

  function addArticle(articleId: string, articleNom: string) {
    setSelected((s) => {
      if (s.find((a) => a.articleId === articleId)) return s;
      return [...s, { articleId, articleNom, quantite: 1 }];
    });
  }

  function updateQty(articleId: string, delta: number) {
    setSelected((s) =>
      s
        .map((a) => (a.articleId === articleId ? { ...a, quantite: Math.max(1, a.quantite + delta) } : a))
        .filter(Boolean)
    );
  }

  function removeArticle(articleId: string) {
    setSelected((s) => s.filter((a) => a.articleId !== articleId));
  }

  function handleSave() {
    if (!nom.trim()) return toast.error("Le nom du pack est obligatoire");
    if (selected.length === 0) return toast.error("Ajoute au moins un article au pack");
    const prix = parseFloat(prixPack.replace(",", "."));
    if (isNaN(prix) || prix <= 0) return toast.error("Prix du pack invalide");

    const payload = {
      nom: nom.trim(),
      section,
      articles: selected,
      prixPack: eurosToCents(prix),
      tauxTVA: parseFloat(tauxTVA),
      imageUrl: null,
    };

    if (pack) {
      updatePack(pack.id, payload);
      toast.success("Pack modifié");
    } else {
      createPack(payload);
      toast.success("Pack créé");
    }
    onOpenChange(false);
  }

  const availableArticles = articles.filter((a) => !selected.find((s) => s.articleId === a.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{pack ? "Modifier le pack" : "Nouveau pack"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>Nom du pack</Label>
              <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Menu supporter" autoFocus />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Prix du pack TTC (€)</Label>
              <Input inputMode="decimal" value={prixPack} onChange={(e) => setPrixPack(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Taux de TVA</Label>
            <Select value={tauxTVA} onValueChange={(v) => setTauxTVA(v as "5.5" | "10" | "20")}>
              <SelectTrigger className="max-w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5.5">5,5 %</SelectItem>
                <SelectItem value="10">10 %</SelectItem>
                <SelectItem value="20">20 %</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Articles inclus</Label>
            {selected.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun article sélectionné</p>
            ) : (
              <div className="flex flex-col gap-2">
                {selected.map((a) => (
                  <div key={a.articleId} className="flex items-center gap-2 rounded-lg border border-border p-2">
                    <span className="flex-1 text-sm font-medium">{a.articleNom}</span>
                    <button
                      onClick={() => updateQty(a.articleId, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-usl-gray"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{a.quantite}</span>
                    <button
                      onClick={() => updateQty(a.articleId, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-usl-gray"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeArticle(a.articleId)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-destructive hover:bg-usl-danger-light"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {availableArticles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {availableArticles.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => addArticle(a.id, a.nom)}
                    className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
                  >
                    + {a.nom}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
