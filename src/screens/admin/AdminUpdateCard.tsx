import { useEffect, useState } from "react";
import { RefreshCw, Download, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_VERSION, isElectron, checkForUpdateWeb } from "@/lib/updater";
import { toast } from "sonner";

type Phase =
  | "idle"
  | "checking"
  | "up-to-date"
  | "available"
  | "downloading"
  | "ready"
  | "error";

export function AdminUpdateCard() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [apkUrl, setApkUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;
    return window.electronAPI.onUpdateStatus((status) => {
      if (status.state === "available") {
        setPhase("available");
        setLatestVersion(status.version ?? null);
      } else if (status.state === "up-to-date") {
        setPhase("up-to-date");
      } else if (status.state === "downloading") {
        setPhase("downloading");
        setPercent(status.percent ?? 0);
      } else if (status.state === "ready") {
        setPhase("ready");
      } else if (status.state === "error") {
        setPhase("error");
        setErrorMsg(status.message ?? "Erreur inconnue");
      }
    });
  }, []);

  async function handleCheck() {
    setPhase("checking");
    setErrorMsg("");
    try {
      if (isElectron && window.electronAPI) {
        const result = await window.electronAPI.checkForUpdate();
        if (result.error) {
          setPhase("error");
          setErrorMsg(result.error);
        }
        // Otherwise the "update:status" listener above drives the phase.
      } else {
        const result = await checkForUpdateWeb();
        setApkUrl(result.apkUrl);
        setLatestVersion(result.latestVersion);
        setPhase(result.available ? "available" : "up-to-date");
      }
    } catch (e) {
      setPhase("error");
      setErrorMsg((e as Error).message);
    }
  }

  async function handleDownload() {
    if (isElectron && window.electronAPI) {
      const result = await window.electronAPI.downloadUpdate();
      if (result.error) {
        setPhase("error");
        setErrorMsg(result.error);
      }
    } else if (apkUrl) {
      window.open(apkUrl, "_blank");
      toast.info("Téléchargement lancé — installe le fichier une fois téléchargé");
    }
  }

  async function handleInstall() {
    if (isElectron && window.electronAPI) {
      await window.electronAPI.quitAndInstall();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" /> Mises à jour
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Version installée : <strong>{APP_VERSION}</strong>
          {isElectron ? " (Windows)" : " (Android)"}
        </p>

        {phase === "up-to-date" && (
          <p className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Tu as déjà la dernière version
          </p>
        )}

        {phase === "available" && latestVersion && (
          <p className="text-sm text-usl-warning">
            Nouvelle version disponible : <strong>{latestVersion}</strong>
          </p>
        )}

        {phase === "downloading" && (
          <p className="text-sm text-muted-foreground">Téléchargement en cours… {percent}%</p>
        )}

        {phase === "ready" && (
          <p className="text-sm text-success">Mise à jour téléchargée, prête à installer.</p>
        )}

        {phase === "error" && <p className="text-sm text-destructive">Erreur : {errorMsg}</p>}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={handleCheck}
            disabled={phase === "checking" || phase === "downloading"}
          >
            <RefreshCw className="h-4 w-4" /> Vérifier les mises à jour
          </Button>

          {phase === "available" && (
            <Button onClick={handleDownload}>
              {isElectron ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
              {isElectron ? "Télécharger la mise à jour" : "Télécharger l'APK"}
            </Button>
          )}

          {phase === "ready" && isElectron && (
            <Button variant="success" onClick={handleInstall}>
              <Download className="h-4 w-4" /> Redémarrer et installer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
