import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfig } from "@/hooks/useData";
import { setAdminPassword, updateConfig } from "@/lib/config";
import { AdminUpdateCard } from "@/screens/admin/AdminUpdateCard";
import { COUPURES_LABELS, type CoupureCle } from "@/types";
import { toast } from "sonner";

const ALL_COUPURES = Object.keys(COUPURES_LABELS) as CoupureCle[];

export function AdminParametresTab() {
  const config = useConfig();
  const [clubName, setClubName] = useState(config.clubName);
  const [newPassword, setNewPassword] = useState("");

  function toggleCoupure(c: CoupureCle, active: boolean) {
    const next = active
      ? [...config.coupuresActives, c]
      : config.coupuresActives.filter((x) => x !== c);
    updateConfig({ coupuresActives: next });
  }

  function saveClubName() {
    updateConfig({ clubName: clubName.trim() || config.clubName });
    toast.success("Nom du club mis à jour");
  }

  async function savePassword() {
    if (newPassword.length < 4) return toast.error("Mot de passe trop court (4 caractères min.)");
    await setAdminPassword(newPassword);
    setNewPassword("");
    toast.success("Mot de passe admin mis à jour");
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Nom du club</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input value={clubName} onChange={(e) => setClubName(e.target.value)} />
          <Button onClick={saveClubName}>Enregistrer</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" /> Mot de passe admin
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button onClick={savePassword}>Modifier</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coupures pour le fond de caisse</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ALL_COUPURES.map((c) => (
            <div key={c} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
              <Label htmlFor={`coupure-${c}`} className="font-normal">
                {COUPURES_LABELS[c]}
              </Label>
              <Switch
                id={`coupure-${c}`}
                checked={config.coupuresActives.includes(c)}
                onCheckedChange={(v) => toggleCoupure(c, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <AdminUpdateCard />
    </div>
  );
}
