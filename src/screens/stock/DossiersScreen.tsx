import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, MoreVertical, Pencil, Trash2, FolderOpen, Package2 } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/ui/button";
import { DossierIcon } from "@/components/DossierIcon";
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
    <div className="relative flex h-screen w-screen flex-col bg-usl-gray">
      <ScreenHeader
        title={sec === "boutique" ? "Boutique" : "Buvette / Bar"}
        subtitle="Produits globaux"
        onBack={() => navigate(`/gestion/${sec}`)}
        right={
          <Button variant="secondary" onClick={() => navigate(`/gestion/${sec}/produits/packs`)}>
            <Package2 className="h-4 w-4" /> Packs
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {dossiers.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <FolderOpen className="h-12 w-12 opacity-40" />
            <p className="text-lg">Aucun dossier pour l'instant</p>
            <p className="text-sm">Crée ton premier dossier avec le bouton +</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {dossiers.map((d) => {
              const count = articles.filter((a) => a.dossierId === d.id).length;
              const alertCount = articles.filter(
                (a) => a.dossierId === d.id && a.stock <= a.seuilAlerte
              ).length;
              return (
                <div
                  key={d.id}
                  className="group relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <button
                    onClick={() => navigate(`/gestion/${sec}/produits/${d.id}`)}
                    className="flex w-full flex-col items-center gap-2"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-usl-blue-light text-primary">
                      <DossierIcon value={d.icone} className="h-7 w-7" />
                    </div>
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
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
                        aria-label="Options du dossier"
                      >
                        <MoreVertical className="h-5 w-5" />
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

      <Button
        size="icon-sm"
        onClick={openCreate}
        className="absolute bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
        aria-label="Créer un dossier"
      >
        <Plus className="h-7 w-7" />
      </Button>

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
