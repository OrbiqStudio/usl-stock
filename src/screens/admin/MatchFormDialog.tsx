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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createMatch } from "@/lib/data";
import { TYPE_MATCH_LABELS, type TypeMatch } from "@/types";
import { toast } from "sonner";

export function MatchFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [nom, setNom] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<TypeMatch>("championnat");

  useEffect(() => {
    if (open) {
      setNom("");
      setDate(new Date().toISOString().slice(0, 10));
      setType("championnat");
    }
  }, [open]);

  function handleSave() {
    if (!nom.trim()) return toast.error("Le nom du match est obligatoire");
    if (!date) return toast.error("La date est obligatoire");
    createMatch(nom.trim(), new Date(date).getTime(), type);
    toast.success("Match créé");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau match</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="match-nom">Nom du match</Label>
            <Input
              id="match-nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex : USL vs Cholet Basket"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="match-date">Date</Label>
            <Input id="match-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as TypeMatch)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_MATCH_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Créer le match</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
