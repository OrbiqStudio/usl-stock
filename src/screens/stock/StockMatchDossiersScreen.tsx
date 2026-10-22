import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FolderOpen, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { setStockSection } from "@/lib/data";
import { ScreenHeader } from "@/components/ScreenHeader";
import { DossierIcon } from "@/components/DossierIcon";
import { AnimatedFolder } from "@/components/ui/animated-folder";
import { useActiveMatch, useDossiers, useArticlesBySection } from "@/hooks/useData";
import type { Section } from "@/types";

export default function StockMatchDossiersScreen() {
  const navigate = useNavigate();
  const { section } = useParams<{ section: Section }>();
  const sec = (section as Section) ?? "boutique";
  const activeMatch = useActiveMatch();
  const dossiers = useDossiers(sec);
  const articles = useArticlesBySection(sec);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetValue, setResetValue] = useState("10");

  function handleReset() {
    const n = parseInt(resetValue, 10);
    if (isNaN(n) || n < 0) {
      toast.error("Quantité invalide");
      return;
    }
    const count = setStockSection(sec, n);
    toast.success(`Stock de ${count} article${count > 1 ? "s" : ""} remis à ${n}`);
    setResetOpen(false);
  }

  if (!activeMatch) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-white text-center">
        <h2 className="text-2xl font-bold">Aucun match en cours</h2>
        <button onClick={() => navigate(`/gestion/${sec}`)} className="text-primary underline">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-white">
      <ScreenHeader
        title={`Stock — ${activeMatch.nom}`}
        subtitle={sec === "boutique" ? "Boutique" : "Buvette / Bar"}
        onBack={() => navigate(`/gestion/${sec}`)}
        right={
          <Button variant="outline" className="rounded-full" onClick={() => setResetOpen(true)}>
            <RotateCcw className="h-4 w-4" /> Remettre tout le stock à…
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
        {dossiers.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <FolderOpen strokeWidth={1.5} className="h-12 w-12 opacity-40" />
            <p className="text-lg">Aucun dossier</p>
            <p className="text-sm">
              Crée d'abord tes articles depuis "Produits globaux"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {dossiers.map((d) => {
              const dossierArticles = articles.filter((a) => a.dossierId === d.id);
              const count = dossierArticles.length;
              const previewImages = dossierArticles
                .filter((a) => a.imageUrl)
                .slice(0, 3)
                .map((a) => a.imageUrl);
              return (
                <button
                  key={d.id}
                  onClick={() => navigate(`/gestion/${sec}/stock/${d.id}`)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-6 transition-colors hover:border-primary"
                >
                  <AnimatedFolder
                    icon={<DossierIcon value={d.icone} className="h-6 w-6" />}
                    previewImages={previewImages}
                  />
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

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remettre tout le stock à une même quantité</DialogTitle>
            <DialogDescription>
              Tous les articles {sec === "boutique" ? "de la boutique" : "de la buvette"} ({articles.length}) passeront à
              cette quantité. Pour les boissons à contenances, c'est en verres de 25 cl.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={resetValue}
            onChange={(e) => setResetValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReset()}
            className="text-center text-lg"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleReset}>Appliquer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
