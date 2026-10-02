import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import {
  useActiveMatch,
  useArticlesBySection,
  useCommande,
  useCommandesEnCoursAutres,
  useDossiers,
  useFavoris,
  usePacks,
  useTabletteId,
} from "@/hooks/useData";
import {
  addArticleToCommande,
  addPackToCommande,
  addConsigne,
  removeConsigne,
  annulerCommande,
  createCommande,
  payerCommande,
  removeLigne,
  setRemise,
  updateLigneQuantite,
} from "@/lib/data";
import { commandesCol } from "@/lib/collections";
import { CaisseSidebar } from "@/screens/direct/components/CaisseSidebar";
import { CommandeRecap } from "@/screens/direct/components/CommandeRecap";
import { ArticleGrid } from "@/screens/direct/components/ArticleGrid";
import { CategorySidebar, type CategoryKey } from "@/screens/direct/components/CategorySidebar";
import { OtherOrdersBar } from "@/screens/direct/components/OtherOrdersBar";
import { RemiseDialog } from "@/screens/direct/components/RemiseDialog";
import { AnnulerDialog } from "@/screens/direct/components/AnnulerDialog";
import { EncaissementDialog } from "@/screens/direct/components/EncaissementDialog";
import { LowStockPopup } from "@/screens/direct/components/LowStockPopup";
import { ContenanceDialog } from "@/screens/direct/components/ContenanceDialog";
import { PackSlotDialog } from "@/screens/direct/components/PackSlotDialog";
import type { Article, Contenance, MoyenPaiement, Pack, PackSlotOption, Section } from "@/types";
import { toast } from "sonner";

export default function CaisseScreen() {
  const navigate = useNavigate();
  const { section } = useParams<{ section: Section }>();
  const sec = (section as Section) ?? "boutique";
  const tabletteId = useTabletteId();
  const activeMatch = useActiveMatch();

  const dossiers = useDossiers(sec);
  const allArticles = useArticlesBySection(sec);
  const favoris = useFavoris(sec);
  const packs = usePacks(sec);

  const [commandeId, setCommandeId] = useState<string | null>(null);
  const commande = useCommande(commandeId ?? undefined);
  const autresCommandes = useCommandesEnCoursAutres(activeMatch?.id, tabletteId);

  const [category, setCategory] = useState<CategoryKey>("favoris");
  const [search, setSearch] = useState("");
  const [remiseOpen, setRemiseOpen] = useState(false);
  const [annulerOpen, setAnnulerOpen] = useState(false);
  const [encaissementOpen, setEncaissementOpen] = useState(false);
  const [quickMoyen, setQuickMoyen] = useState<MoyenPaiement | null>(null);
  const [alcoolArticle, setAlcoolArticle] = useState<Article | null>(null);
  const [packSlotTarget, setPackSlotTarget] = useState<Pack | null>(null);

  // Find-or-create the working commande for this tablette/match/section.
  useEffect(() => {
    if (!activeMatch) return;
    const existing = commandesCol
      .getAll()
      .find(
        (c) =>
          c.matchId === activeMatch.id &&
          c.section === sec &&
          c.tabletteId === tabletteId &&
          c.statut === "en_cours"
      );
    if (existing) {
      setCommandeId(existing.id);
    } else {
      createCommande(activeMatch.id, sec, tabletteId).then((c) => setCommandeId(c.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMatch?.id, sec, tabletteId]);

  // Low stock popup queue — reacts to real-time stock changes from any tablette.
  const prevStockRef = useRef<Record<string, number> | null>(null);
  const [lowStockQueue, setLowStockQueue] = useState<{ id: string; nom: string; stock: number }[]>([]);

  useEffect(() => {
    const prev = prevStockRef.current;
    if (prev) {
      const newly: { id: string; nom: string; stock: number }[] = [];
      allArticles.forEach((a) => {
        const before = prev[a.id];
        if (before !== undefined && before > a.seuilAlerte && a.stock <= a.seuilAlerte && a.stock > 0) {
          newly.push({ id: crypto.randomUUID(), nom: a.nom, stock: a.stock });
        }
      });
      if (newly.length > 0 && !encaissementOpen) {
        setLowStockQueue((q) => [...q, ...newly]);
      }
    }
    const map: Record<string, number> = {};
    allArticles.forEach((a) => {
      map[a.id] = a.stock;
    });
    prevStockRef.current = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allArticles]);

  const quantities = useMemo(() => {
    const map: Record<string, number> = {};
    commande?.lignes.forEach((l) => {
      if (!l.packId) map[l.articleId] = (map[l.articleId] ?? 0) + l.quantite;
    });
    return map;
  }, [commande]);

  const displayedArticles = useMemo(() => {
    if (category === "favoris") return favoris;
    if (category === "packs") return [];
    return allArticles.filter((a) => a.dossierId === category);
  }, [category, favoris, allArticles]);

  function startNewCommande() {
    if (!activeMatch) return;
    createCommande(activeMatch.id, sec, tabletteId).then((c) => setCommandeId(c.id));
  }

  function handleNouvelle() {
    if (commande && commande.lignes.length > 0) {
      annulerCommande(commande.id, "Nouvelle commande démarrée");
    } else if (commande) {
      return;
    }
    startNewCommande();
  }

  function handleSelectArticle(a: Article) {
    if (!commande) return;
    const already = quantities[a.id] ?? 0;
    if (already >= a.stock) {
      toast.error(`Stock insuffisant pour "${a.nom}"`);
      return;
    }
    if (a.estAlcool) {
      setAlcoolArticle(a);
      return;
    }
    addArticleToCommande(commande.id, a);
    if (a.consigneAuto) addConsigne(commande.id, 1);
  }

  function handleChooseContenance(contenance: Contenance) {
    if (!commande || !alcoolArticle) return;
    addArticleToCommande(commande.id, alcoolArticle, 1, contenance);
    if (alcoolArticle.consigneAuto) addConsigne(commande.id, 1);
    setAlcoolArticle(null);
  }

  function handleDecrementArticle(a: Article) {
    if (!commande) return;
    const index = commande.lignes.findIndex((l) => l.articleId === a.id && !l.packId);
    if (index === -1) return;
    updateLigneQuantite(commande.id, index, commande.lignes[index].quantite - 1);
  }

  function handleIncrementLigne(i: number) {
    if (!commande) return;
    const ligne = commande.lignes[i];
    if (!ligne.packId) {
      const article = allArticles.find((a) => a.id === ligne.articleId);
      if (article && ligne.quantite >= article.stock) {
        toast.error(`Stock insuffisant pour "${ligne.articleNom}"`);
        return;
      }
    }
    updateLigneQuantite(commande.id, i, ligne.quantite + 1);
  }

  function handleSelectPack(p: Pack) {
    if (!commande) return;
    if (p.slots.length > 0) {
      setPackSlotTarget(p);
      return;
    }
    addPackToCommande(commande.id, p);
  }

  function handleConfirmPackSlot(choix: PackSlotOption[]) {
    if (!commande || !packSlotTarget) return;
    addPackToCommande(commande.id, packSlotTarget, choix);
    setPackSlotTarget(null);
  }

  function handleAnnulerConfirm(motif: string) {
    if (!commande) return;
    annulerCommande(commande.id, motif);
    toast.success("Commande annulée");
    startNewCommande();
  }

  function handleOpenEncaissement() {
    setQuickMoyen(null);
    setEncaissementOpen(true);
  }

  function handleQuickPay(moyen: MoyenPaiement) {
    setQuickMoyen(moyen);
    setEncaissementOpen(true);
  }

  function handlePaiementConfirme(moyen: MoyenPaiement, montantRecu: number | null) {
    if (!commande) return;
    payerCommande(commande.id, moyen, montantRecu);
    setEncaissementOpen(false);
    setQuickMoyen(null);
    toast.success("Commande payée");
    startNewCommande();
  }

  if (!activeMatch) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-usl-gray text-center">
        <TriangleAlert className="h-14 w-14 text-usl-warning" />
        <h2 className="text-2xl font-bold">Aucun événement en cours</h2>
        <button onClick={() => navigate("/direct")} className="text-primary underline">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col gap-3 overflow-hidden bg-usl-gray p-3">
      <div className="flex flex-1 gap-3 overflow-hidden">
        <CaisseSidebar
          match={activeMatch}
          commande={commande}
          onNouvelle={handleNouvelle}
          onEncaisser={handleOpenEncaissement}
          onAnnuler={() => setAnnulerOpen(true)}
          onHome={() => navigate("/")}
        />

        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          <CategorySidebar
            dossiers={dossiers}
            articles={allArticles}
            packs={packs}
            favoris={favoris}
            selected={category}
            onSelect={setCategory}
          />

          <ArticleGrid
            mode={category === "packs" ? "packs" : "articles"}
            articles={displayedArticles}
            packs={packs}
            quantities={quantities}
            search={search}
            onSearchChange={setSearch}
            onSelectArticle={handleSelectArticle}
            onDecrementArticle={handleDecrementArticle}
            onSelectPack={handleSelectPack}
          />
        </div>

        <CommandeRecap
          commande={commande}
          onIncrement={handleIncrementLigne}
          onDecrement={(i) => commande && updateLigneQuantite(commande.id, i, commande.lignes[i].quantite - 1)}
          onRemove={(i) => commande && removeLigne(commande.id, i)}
          onOpenRemise={() => setRemiseOpen(true)}
          onQuickPay={handleQuickPay}
          onAddConsigne={() => commande && addConsigne(commande.id, 1)}
          onRemoveConsigne={() => commande && removeConsigne(commande.id, 1)}
        />
      </div>

      <OtherOrdersBar commandes={autresCommandes} />

      <ContenanceDialog
        article={alcoolArticle}
        onOpenChange={(o) => !o && setAlcoolArticle(null)}
        onChoose={handleChooseContenance}
      />

      <PackSlotDialog
        pack={packSlotTarget}
        onOpenChange={(o) => !o && setPackSlotTarget(null)}
        onConfirm={handleConfirmPackSlot}
      />

      <RemiseDialog
        open={remiseOpen}
        onOpenChange={setRemiseOpen}
        current={commande?.remise ?? null}
        onApply={(r) => commande && setRemise(commande.id, r)}
      />

      <AnnulerDialog
        open={annulerOpen}
        onOpenChange={setAnnulerOpen}
        numero={commande?.numero}
        onConfirm={handleAnnulerConfirm}
      />

      <EncaissementDialog
        open={encaissementOpen}
        onOpenChange={(o) => {
          setEncaissementOpen(o);
          if (!o) setQuickMoyen(null);
        }}
        commande={commande}
        initialMoyen={quickMoyen}
        onConfirmed={handlePaiementConfirme}
      />

      {lowStockQueue[0] && (
        <LowStockPopup
          articleNom={lowStockQueue[0].nom}
          stock={lowStockQueue[0].stock}
          onClose={() => setLowStockQueue((q) => q.slice(1))}
        />
      )}
    </div>
  );
}
