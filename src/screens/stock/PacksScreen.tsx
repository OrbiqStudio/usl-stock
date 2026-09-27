import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Package2, Pencil, Trash2 } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/ui/button";
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
import { usePacks } from "@/hooks/useData";
import { deletePack } from "@/lib/data";
import { PackFormDialog } from "@/screens/admin/PackFormDialog";
import { formatEuros } from "@/lib/money";
import type { Pack, Section } from "@/types";
import { toast } from "sonner";

export default function PacksScreen() {
  const navigate = useNavigate();
  const { section } = useParams<{ section: Section }>();
  const sec = (section as Section) ?? "boutique";
  const packs = usePacks(sec);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Pack | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Pack | null>(null);

  return (
    <div className="flex h-screen w-screen flex-col bg-usl-gray">
      <ScreenHeader
        title="Packs"
        subtitle={sec === "boutique" ? "Boutique" : "Buvette / Bar"}
        onBack={() => navigate(`/gestion/${sec}/produits`)}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-5 w-5" /> Nouveau pack
            </Button>
          </div>

          {packs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
              <Package2 className="h-10 w-10 opacity-40" />
              <p>Aucun pack pour cette section</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {packs.map((p) => (
                <div key={p.id} className="flex flex-col gap-2 rounded-xl border border-border bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold">{p.nom}</div>
                      <div className="text-sm text-muted-foreground">
                        {p.articles.map((a) => `${a.quantite}× ${a.articleNom}`).join(", ")}
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-lg font-extrabold text-primary">
                      {formatEuros(p.prixPack)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditing(p);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" /> Modifier
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(p)}>
                      <Trash2 className="h-4 w-4" /> Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PackFormDialog open={formOpen} onOpenChange={setFormOpen} section={sec} pack={editing} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer "{deleteTarget?.nom}" ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deletePack(deleteTarget.id);
                  toast.success("Pack supprimé");
                }
                setDeleteTarget(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
