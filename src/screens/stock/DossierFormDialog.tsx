import { useEffect, useState } from "react";
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
import { IconPicker } from "@/components/IconPicker";
import type { Dossier, Section } from "@/types";
import { createDossier, updateDossier } from "@/lib/data";
import { toast } from "sonner";

export function DossierFormDialog({
  open,
  onOpenChange,
  section,
  dossier,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section;
  dossier?: Dossier | null;
}) {
  const [nom, setNom] = useState("");
  const [icone, setIcone] = useState("autre");

  useEffect(() => {
    if (open) {
      setNom(dossier?.nom ?? "");
      setIcone(dossier?.icone ?? "autre");
    }
  }, [open, dossier]);

  function handleSave() {
    if (!nom.trim()) {
      toast.error("Le nom du dossier est obligatoire");
      return;
    }
    if (dossier) {
      updateDossier(dossier.id, { nom: nom.trim(), icone });
      toast.success("Dossier modifié");
    } else {
      createDossier(section, nom.trim(), icone);
      toast.success("Dossier créé");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dossier ? "Modifier le dossier" : "Nouveau dossier"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="dossier-nom">Nom du dossier</Label>
            <Input
              id="dossier-nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex : Boissons, Maillots..."
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Icône</Label>
            <IconPicker value={icone} onChange={setIcone} />
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
