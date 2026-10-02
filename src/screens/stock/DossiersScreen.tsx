import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, MoreVertical, Pencil, Trash2, FolderOpen, Package2 } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { DossierIcon } from "@/components/DossierIcon";
import { AnimatedFolder } from "@/components/ui/animated-folder";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useDossiers, useArticlesBySection } from "@/hooks/useData";
import { deleteDossier } from "@/lib/data";
import { DossierFormDialog } from "@/screens/stock/DossierFormDialog";
import type { Dossier, Section } from "@/types";
import { toast } from "sonner";

export default function DossiersScreen() {
  const navigate = useNavigate();
  const { section } = useParams<{ section: Section }>();
  const sec = (section as Section) ?? "boutique";
  const dossiers = useDossiers(sec);
  const articles = useArticlesBySection(sec);

  const [formOpen, setFormOpen] = useState(false);
  const [editingDossier, setEditingDossier] = useState<Dossier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dossier | null>(null);

  function openCreate() {
    setEditingDossier(null);
    setFormOpen(true);
  }

  function openEdit(d: Dossier) {
    setEditingDossier(d);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (deleteTarget) {
      deleteDossier(deleteTarget.id);
      toast.success("Dossier supprimé");
      setDeleteTarget(null);
    }
  }

  return (
    <div className="relative flex h-screen w-screen flex-col bg-white">
      <ScreenHeader
        title={sec === "boutique" ? "Boutique" : "Buvette / Bar"}
        subtitle="Produits globaux"
        onBack={() => navigate(`/gestion/${sec}`)}
        right={
          <button
            onClick={() => navigate(`/gestion/${sec}/produits/packs`)}
            className="flex items-center gap-2 rounded-full border-2 border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors active:bg-usl-gray"
          >
            <Package2 strokeWidth={1.75} className="h-4 w-4" /> Packs
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 pb-24 pt-2">
        {dossiers.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <FolderOpen strokeWidth={1.5} className="h-12 w-12 opacity-40" />
            <p className="text-lg">Aucun dossier pour l'instant</p>
            <p className="text-sm">Crée ton premier dossier avec le bouton +</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {dossiers.map((d) => {
              const dossierArticles = articles.filter((a) => a.dossierId === d.id);
              const count = dossierArticles.length;
              const alertCount = dossierArticles.filter((a) => a.stock <= a.seuilAlerte).length;
              const previewImages = dossierArticles
                .filter((a) => a.imageUrl)
                .slice(0, 3)
                .map((a) => a.imageUrl);
              return (
                <div
                  key={d.id}
                  className="group relative flex flex-col items-center gap-1 rounded-2xl border border-border bg-white p-6 transition-colors hover:border-primary"
                >
                  <button
                    onClick={() => navigate(`/gestion/${sec}/produits/${d.id}`)}
                    className="flex w-full flex-col items-center gap-2"
                  >
                    <AnimatedFolder
                      icon={<DossierIcon value={d.icone} className="h-6 w-6" />}
                      previewImages={previewImages}
                    />
                    <span className="text-center text-lg font-bold">{d.nom}</span>
                    <span className="text-sm text-muted-foreground">
                      {count} article{count > 1 ? "s" : ""}
                    </span>
                    {alertCount > 0 && (
                      <span className="rounded-full bg-usl-danger-light px-2.5 py-0.5 text-xs font-bold text-usl-danger">
                        {alertCount} en alerte
                      </span>
                    )}
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-usl-gray"
                        aria-label="Options du dossier"
                      >
                        <MoreVertical strokeWidth={1.75} className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(d)}>
                        <Pencil className="h-4 w-4" /> Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem destructive onClick={() => setDeleteTarget(d)}>
                        <Trash2 className="h-4 w-4" /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={openCreate}
        className="absolute bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity active:opacity-90"
        aria-label="Créer un dossier"
      >
        <Plus strokeWidth={1.75} className="h-6 w-6" />
      </button>

      <DossierFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        section={sec}
        dossier={editingDossier}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer "{deleteTarget?.nom}" ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tous les articles de ce dossier seront également supprimés. Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
