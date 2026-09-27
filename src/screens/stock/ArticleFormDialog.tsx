import { useEffect, useRef, useState } from "react";
import { ImagePlus, Star, Trash2, Beer } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle as AlertTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CONTENANCES, type Article, type Contenance, type Section } from "@/types";
import { createArticle, updateArticle, deleteArticle } from "@/lib/data";
import { compressImageToDataUrl } from "@/lib/storage";
import { eurosToCents, centsToEuros, formatEuros, ttcToHt } from "@/lib/money";
import { toast } from "sonner";

export function ArticleFormDialog({
  open,
  onOpenChange,
  section,
  dossierId,
  article,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section;
  dossierId: string;
  article?: Article | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nom, setNom] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prixAchat, setPrixAchat] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [tauxTVA, setTauxTVA] = useState<"5.5" | "10" | "20">("20");
  const [seuilAlerte, setSeuilAlerte] = useState("5");
  const [favori, setFavori] = useState(false);
  const [estAlcool, setEstAlcool] = useState(false);
  const [contenancesPrix, setContenancesPrix] = useState<Record<Contenance, string>>({
    "25cl": "",
    "33cl": "",
    "50cl": "",
  });
  const [stockEnBouteilles, setStockEnBouteilles] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setNom(article?.nom ?? "");
      setImageUrl(article?.imageUrl ?? null);
      setPrixAchat(article ? String(centsToEuros(article.prixAchat)) : "");
      setPrixVente(article ? String(centsToEuros(article.prixVente)) : "");
      setTauxTVA(article ? (String(article.tauxTVA) as "5.5" | "10" | "20") : "20");
      setSeuilAlerte(String(article?.seuilAlerte ?? 5));
      setFavori(article?.favori ?? false);
      setEstAlcool(article?.estAlcool ?? false);
      setStockEnBouteilles(article?.stockEnBouteilles ?? false);
      setContenancesPrix({
        "25cl": article?.contenances?.["25cl"] != null ? String(centsToEuros(article.contenances["25cl"])) : "",
        "33cl": article?.contenances?.["33cl"] != null ? String(centsToEuros(article.contenances["33cl"])) : "",
        "50cl": article?.contenances?.["50cl"] != null ? String(centsToEuros(article.contenances["50cl"])) : "",
      });
    }
  }, [open, article]);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setImageUrl(dataUrl);
    } catch {
      toast.error("Impossible de charger cette image");
    }
  }

  function toggleContenance(c: Contenance, active: boolean) {
    setContenancesPrix((prev) => ({ ...prev, [c]: active ? prev[c] || "0" : "" }));
  }

  function handleSave() {
    if (!nom.trim()) return toast.error("Le nom de l'article est obligatoire");
    const prixAchatNum = parseFloat(prixAchat.replace(",", ".")) || 0;

    let prixVenteCents = 0;
    const contenances: Partial<Record<Contenance, number>> = {};

    if (estAlcool) {
      const actives = CONTENANCES.filter((c) => contenancesPrix[c].trim() !== "");
      if (actives.length === 0) {
        return toast.error("Active au moins une contenance (25/33/50cl) avec un prix");
      }
      for (const c of actives) {
        const p = parseFloat(contenancesPrix[c].replace(",", "."));
        if (isNaN(p) || p <= 0) return toast.error(`Prix invalide pour la contenance ${c}`);
        contenances[c] = eurosToCents(p);
      }
    } else {
      const prixVenteNum = parseFloat(prixVente.replace(",", "."));
      if (isNaN(prixVenteNum) || prixVenteNum <= 0) return toast.error("Prix de vente invalide");
      prixVenteCents = eurosToCents(prixVenteNum);
    }

    const bouteillesActif = estAlcool && contenancesPrix["25cl"] !== "" && stockEnBouteilles;

    const base = {
      dossierId,
      section,
      nom: nom.trim(),
      imageUrl,
      prixAchat: eurosToCents(prixAchatNum),
      prixVente: prixVenteCents,
      tauxTVA: parseFloat(tauxTVA) as 5.5 | 10 | 20,
      seuilAlerte: parseInt(seuilAlerte, 10) || 0,
      favori,
      estAlcool,
      contenances,
      stockEnBouteilles: bouteillesActif,
    };

    if (article) {
      updateArticle(article.id, base);
      toast.success("Article modifié");
    } else {
      createArticle({ ...base, stock: 0, bouteilles1L: 0, bouteilles15L: 0 });
      toast.success("Article créé");
    }
    onOpenChange(false);
  }

  function handleDelete() {
    if (article) {
      deleteArticle(article.id);
      toast.success("Article supprimé");
      setConfirmDelete(false);
      onOpenChange(false);
    }
  }

  const prixVenteNum = parseFloat(prixVente.replace(",", ".")) || 0;
  const prixAchatNum = parseFloat(prixAchat.replace(",", ".")) || 0;
  const prixVenteHT = ttcToHt(eurosToCents(prixVenteNum), parseFloat(tauxTVA)).ht;
  const margeUnitaire = prixVenteHT - eurosToCents(prixAchatNum);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{article ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-usl-gray text-muted-foreground hover:border-primary hover:text-primary"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs">Ajouter une image</span>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              <button
                type="button"
                onClick={() => setFavori((f) => !f)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                  favori ? "bg-usl-warning-light text-usl-warning" : "bg-usl-gray text-muted-foreground"
                }`}
              >
                <Star className={`h-4 w-4 ${favori ? "fill-usl-warning" : ""}`} />
                Favori
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="article-nom">Nom de l'article</Label>
                <Input id="article-nom" value={nom} onChange={(e) => setNom(e.target.value)} autoFocus />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="article-seuil">Seuil d'alerte</Label>
                <Input
                  id="article-seuil"
                  type="number"
                  inputMode="numeric"
                  value={seuilAlerte}
                  onChange={(e) => setSeuilAlerte(e.target.value)}
                  className="max-w-[160px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="article-achat">Prix d'achat HT (€)</Label>
                  <Input
                    id="article-achat"
                    inputMode="decimal"
                    value={prixAchat}
                    onChange={(e) => setPrixAchat(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                {!estAlcool && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="article-vente">Prix de vente TTC (€)</Label>
                    <Input
                      id="article-vente"
                      inputMode="decimal"
                      value={prixVente}
                      onChange={(e) => setPrixVente(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Taux de TVA</Label>
                <Select value={tauxTVA} onValueChange={(v) => setTauxTVA(v as "5.5" | "10" | "20")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5.5">5,5 %</SelectItem>
                    <SelectItem value="10">10 %</SelectItem>
                    <SelectItem value="20">20 %</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="article-alcool" className="flex items-center gap-2 font-semibold">
                    <Beer className="h-4 w-4" /> C'est de l'alcool
                  </Label>
                  <Switch id="article-alcool" checked={estAlcool} onCheckedChange={setEstAlcool} />
                </div>
                {estAlcool && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">
                      Active les contenances vendues, avec leur prix TTC. Au moment de la vente, une
                      fenêtre demandera de choisir laquelle.
                    </p>
                    {CONTENANCES.map((c) => (
                      <div key={c} className="flex items-center gap-3">
                        <Switch
                          checked={contenancesPrix[c] !== ""}
                          onCheckedChange={(v) => toggleContenance(c, v)}
                        />
                        <span className="w-12 text-sm font-semibold">{c}</span>
                        <Input
                          inputMode="decimal"
                          placeholder="0,00 €"
                          disabled={contenancesPrix[c] === ""}
                          value={contenancesPrix[c]}
                          onChange={(e) =>
                            setContenancesPrix((prev) => ({ ...prev, [c]: e.target.value }))
                          }
                          className="max-w-[120px]"
                        />
                      </div>
                    ))}

                    {contenancesPrix["25cl"] !== "" && (
                      <div className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-usl-gray p-2.5">
                        <div>
                          <Label htmlFor="article-bouteilles" className="font-semibold">
                            Stock en bouteilles (1L / 1,5L)
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            25cl = 1 verre → 1L = 4 verres, 1,5L = 6 verres. Le stock se saisira en
                            nombre de bouteilles, converti automatiquement en verres.
                          </p>
                        </div>
                        <Switch
                          id="article-bouteilles"
                          checked={stockEnBouteilles}
                          onCheckedChange={setStockEnBouteilles}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!estAlcool && (
                <div className="rounded-lg bg-usl-gray px-4 py-3 text-sm">
                  <span>
                    Marge unitaire (HT) :{" "}
                    <strong className={margeUnitaire >= 0 ? "text-success" : "text-destructive"}>
                      {formatEuros(margeUnitaire)}
                    </strong>
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                La quantité en stock se règle depuis "Stock — [match en cours]" avant chaque
                événement, pas ici.
              </p>
            </div>
          </div>

          <DialogFooter className="justify-between sm:justify-between">
            <div>
              {article && (
                <Button variant="ghost" className="text-destructive" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" /> Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>Sauvegarder</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertTitle>Supprimer "{article?.nom}" ?</AlertTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
