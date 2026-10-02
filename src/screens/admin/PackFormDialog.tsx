import { useEffect, useState } from "react";
import { Minus, Plus, X, Trash2, ListPlus } from "lucide-react";
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
import type { Pack, PackArticle, PackSlot, Section } from "@/types";
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
  const [slots, setSlots] = useState<PackSlot[]>([]);

  useEffect(() => {
    if (open) {
      setNom(pack?.nom ?? "");
      setPrixPack(pack ? String(centsToEuros(pack.prixPack)) : "");
      setTauxTVA(pack ? (String(pack.tauxTVA) as "5.5" | "10" | "20") : "20");
      setSelected(pack?.articles ?? []);
      setSlots(pack?.slots ?? []);
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

  function addSlot() {
    setSlots((s) => [...s, { id: crypto.randomUUID(), label: "", options: [] }]);
  }

  function removeSlot(slotId: string) {
    setSlots((s) => s.filter((sl) => sl.id !== slotId));
  }

  function updateSlotLabel(slotId: string, label: string) {
    setSlots((s) => s.map((sl) => (sl.id === slotId ? { ...sl, label } : sl)));
  }

  function addSlotOption(slotId: string, articleId: string, articleNom: string) {
    setSlots((s) =>
      s.map((sl) =>
        sl.id === slotId && !sl.options.find((o) => o.articleId === articleId)
          ? { ...sl, options: [...sl.options, { articleId, articleNom, prixDelta: 0 }] }
          : sl
      )
    );
  }

  function updateSlotOptionDelta(slotId: string, articleId: string, deltaStr: string) {
    const delta = parseFloat(deltaStr.replace(",", ".").replace(/[^\d.-]/g, ""));
    setSlots((s) =>
      s.map((sl) =>
        sl.id === slotId
          ? {
              ...sl,
              options: sl.options.map((o) =>
                o.articleId === articleId ? { ...o, prixDelta: isNaN(delta) ? 0 : eurosToCents(delta) } : o
              ),
            }
          : sl
      )
    );
  }

  function removeSlotOption(slotId: string, articleId: string) {
    setSlots((s) =>
      s.map((sl) =>
        sl.id === slotId ? { ...sl, options: sl.options.filter((o) => o.articleId !== articleId) } : sl
      )
    );
  }

  function handleSave() {
    if (!nom.trim()) return toast.error("Le nom du pack est obligatoire");
    if (selected.length === 0 && slots.length === 0) {
      return toast.error("Ajoute au moins un article, ou un choix, au pack");
    }
    const prix = parseFloat(prixPack.replace(",", "."));
    if (isNaN(prix) || prix <= 0) return toast.error("Prix du pack invalide");
    for (const s of slots) {
      if (!s.label.trim()) return toast.error("Chaque choix doit avoir un nom (ex : Boisson)");
      if (s.options.length < 2) return toast.error(`Le choix "${s.label || "?"}" doit avoir au moins 2 options`);
    }

    const payload = {
      nom: nom.trim(),
      section,
      articles: selected,
      slots: slots.map((s) => ({ ...s, label: s.label.trim() })),
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pack ? "Modifier le pack" : "Nouveau pack"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>Nom du pack</Label>
              <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Pack Classic" autoFocus />
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
            <Label>Articles toujours inclus</Label>
            {selected.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun article fixe</p>
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

          <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Choix laissés au client (ex : boisson, sandwich)</Label>
              <Button size="sm" variant="secondary" onClick={addSlot}>
                <ListPlus className="h-4 w-4" /> Ajouter un choix
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              À la vente, une fenêtre demandera de choisir une option par choix. Le prix de chaque
              option s'ajoute (ou se retire, si négatif) au prix du pack.
            </p>

            {slots.map((slot) => {
              const slotAvailable = articles.filter((a) => !slot.options.find((o) => o.articleId === a.id));
              return (
                <div key={slot.id} className="flex flex-col gap-2 rounded-lg bg-usl-gray p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={slot.label}
                      onChange={(e) => updateSlotLabel(slot.id, e.target.value)}
                      placeholder="Nom du choix (ex : Boisson)"
                      className="flex-1 bg-white"
                    />
                    <button
                      onClick={() => removeSlot(slot.id)}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-destructive hover:bg-usl-danger-light"
                      aria-label="Supprimer ce choix"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {slot.options.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {slot.options.map((o) => (
                        <div key={o.articleId} className="flex items-center gap-2 rounded-lg border border-border bg-white p-2">
                          <span className="flex-1 truncate text-sm font-medium">{o.articleNom}</span>
                          <Input
                            inputMode="decimal"
                            value={o.prixDelta === 0 ? "" : String(centsToEuros(o.prixDelta))}
                            onChange={(e) => updateSlotOptionDelta(slot.id, o.articleId, e.target.value)}
                            placeholder="0,00"
                            className="w-24 text-right text-sm"
                          />
                          <span className="text-xs text-muted-foreground">€</span>
                          <button
                            onClick={() => removeSlotOption(slot.id, o.articleId)}
                            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-destructive hover:bg-usl-danger-light"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {slotAvailable.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {slotAvailable.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => addSlotOption(slot.id, a.id, a.nom)}
                          className="rounded-full border border-border bg-white px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
                        >
                          + {a.nom}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
