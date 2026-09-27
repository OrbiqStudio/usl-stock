import { useState } from "react";
import { FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useMatchs } from "@/hooks/useData";
import { generateExcelExport, type ExportFilter } from "@/lib/export";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AdminExportTab() {
  const matchs = useMatchs();
  const [mode, setMode] = useState<"tout" | "match" | "periode">("tout");
  const [matchId, setMatchId] = useState<string>("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  function handleExport() {
    let filter: ExportFilter;
    if (mode === "match") {
      if (!matchId) return toast.error("Sélectionne un match");
      filter = { type: "match", matchId };
    } else if (mode === "periode") {
      if (!start || !end) return toast.error("Sélectionne une période");
      filter = { type: "periode", start: new Date(start).getTime(), end: new Date(end).setHours(23, 59, 59, 999) };
    } else {
      filter = { type: "tout" };
    }
    generateExcelExport(filter);
    toast.success("Export généré");
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          <div>
            <div className="text-lg font-bold">Export Excel complet</div>
            <div className="text-sm text-muted-foreground">
              Stock, ventes, résumé et fond de caisse en un seul fichier .xlsx
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Période</Label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "tout", label: "Tout depuis le début" },
                { key: "match", label: "Un match spécifique" },
                { key: "periode", label: "Une période" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMode(opt.key)}
                className={cn(
                  "rounded-lg border-2 px-4 py-2 text-sm font-semibold",
                  mode === opt.key ? "border-primary bg-usl-blue-light text-primary" : "border-border"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "match" && (
          <div className="flex flex-col gap-2">
            <Label>Match</Label>
            <Select value={matchId} onValueChange={setMatchId}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Choisir un match" />
              </SelectTrigger>
              <SelectContent>
                {matchs.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nom} — {new Date(m.date).toLocaleDateString("fr-FR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {mode === "periode" && (
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <Label>Du</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Au</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
        )}

        <Button size="lg" onClick={handleExport} className="self-start">
          <Download className="h-5 w-5" /> Générer l'export Excel
        </Button>
      </CardContent>
    </Card>
  );
}
