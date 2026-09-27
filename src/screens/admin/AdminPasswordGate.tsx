import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyAdminPassword } from "@/lib/config";

export function AdminPasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await verifyAdminPassword(password);
    if (ok) {
      sessionStorage.setItem("usl-stock:admin-auth", "1");
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-usl-gray px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Lock className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold">Espace Administration</h1>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
        <Input
          type="password"
          autoFocus
          placeholder="Mot de passe admin"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          className={error ? "border-destructive" : ""}
        />
        {error && <p className="text-sm text-destructive">Mot de passe incorrect</p>}
        <Button type="submit" size="lg">
          Se connecter
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate("/")}>
          Retour à l'accueil
        </Button>
      </form>
    </div>
  );
}
