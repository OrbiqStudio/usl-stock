import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Package, Check } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActiveMatch, useArticles, useDossiers } from "@/hooks/useData";
import { updateArticle } from "@/lib/data";
import { formatEuros } from "@/lib/money";
import { VERRES_PAR_BOUTEILLE_1L, VERRES_PAR_BOUTEILLE_15L, type Article, type Section } from "@/types";
import { toast } from "sonner";

function ArticleThumb({ article }: { article: Article }) {
  return (
    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-usl-gray">
      {article.imageUrl ? (
        <img src={article.imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <Package className="h-6 w-6 text-muted-foreground" />
      )}
    </div>
  );
}

function StockRow({ article }: { article: Article }) {
  const [value, setValue] = useState(String(article.stock));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) setValue(String(article.stock));
  }, [article.stock, dirty]);

  function save() {
    const n = Math.max(0, parseInt(value, 10) || 0);
    updateArticle(article.id, { stock: n });
    setValue(String(n));
    setDirty(false);
    toast.success(`Stock de "${article.nom}" mis à jour`);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-3">
      <ArticleThumb article={article} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{article.nom}</div>
        <div className="text-sm text-muted-foreground">
          {article.estAlcool
            ? Object.entries(article.contenances)
                .map(([c, p]) => `${c} ${formatEuros(p ?? 0)}`)
                .join(" · ")
            : formatEuros(article.prixVente)}
        </div>
      </div>
      <Input
        type="number"
        inputMode="numeric"
        className="w-24 text-center"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setDirty(true);
        }}
        onKeyDown={(e) => e.key === "Enter" && save()}
      />
      <Button size="icon-sm" variant={dirty ? "success" : "secondary"} onClick={save} aria-label="Enregistrer">
        <Check className="h-4 w-4" />
      </Button>
    </div>
  );
}

function BottleStockRow({ article }: { article: Article }) {
  const [b1L, setB1L] = useState(String(article.bouteilles1L));
  const [b15L, setB15L] = useState(String(article.bouteilles15L));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) {
      setB1L(String(article.bouteilles1L));
      setB15L(String(article.bouteilles15L));
    }
  }, [article.bouteilles1L, article.bouteilles15L, dirty]);

  const n1L = Math.max(0, parseInt(b1L, 10) || 0);
  const n15L = Math.max(0, parseInt(b15L, 10) || 0);
  const totalVerres = n1L * VERRES_PAR_BOUTEILLE_1L + n15L * VERRES_PAR_BOUTEILLE_15L;

  function save() {
    updateArticle(article.id, { stock: totalVerres, bouteilles1L: n1L, bouteilles15L: n15L });
    setB1L(String(n1L));
    setB15L(String(n15L));
    setDirty(false);
    toast.success(`Stock de "${article.nom}" mis à jour (${totalVerres} verres)`);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-3">
      <div className="flex items-center gap-3">
        <ArticleThumb article={article} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{article.nom}</div>
          <div className="text-sm text-muted-foreground">
            {Object.entries(article.contenances)
              .map(([c, p]) => `${c} ${formatEuros(p ?? 0)}`)
              .join(" · ")}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-primary">{totalVerres}</div>
          <div className="text-xs text-muted-foreground">verre{totalVerres > 1 ? "s" : ""}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3 border-t border-border pt-3">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Bouteilles 1L (4 verres)</Label>
          <Input
            type="number"
            inputMode="numeric"
            className="w-24 text-center"
            value={b1L}
            onChange={(e) => {
              setB1L(e.target.value);
              setDirty(true);
            }}
            onKeyDown={(e) => e.key === "Enter" && save()}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Bouteilles 1,5L (6 verres)</Label>
          <Input
            type="number"
            inputMode="numeric"
            className="w-24 text-center"
            value={b15L}
            onChange={(e) => {
              setB15L(e.target.value);
              setDirty(true);
            }}
            onKeyDown={(e) => e.key === "Enter" && save()}
          />
        </div>
        <Button variant={dirty ? "success" : "secondary"} onClick={save}>
          <Check className="h-4 w-4" /> Enregistrer
        </Button>
      </div>
    </div>
  );
}

export default function StockMatchArticlesScreen() {
  const navigate = useNavigate();
  const { section, dossierId } = useParams<{ section: Section; dossierId: string }>();
  const sec = (section as Section) ?? "boutique";
  const activeMatch = useActiveMatch();
  const dossiers = useDossiers(sec);
  const dossier = dossiers.find((d) => d.id === dossierId);
  const articles = useArticles(dossierId);

  if (!activeMatch) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-usl-gray text-center">
        <h2 className="text-2xl font-bold">Aucun match en cours</h2>
        <button onClick={() => navigate(`/gestion/${sec}`)} className="text-primary underline">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-usl-gray">
      <ScreenHeader
        title={dossier ? dossier.nom : "Articles"}
        subtitle={`Stock — ${activeMatch.nom}`}
        onBack={() => navigate(`/gestion/${sec}/stock`)}
      />

      <div className="flex-1 overflow-y-auto p-6">
        {articles.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <Package className="h-12 w-12 opacity-40" />
            <p className="text-lg">Aucun article dans ce dossier</p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {articles.map((a) =>
              a.stockEnBouteilles ? (
                <BottleStockRow key={a.id} article={a} />
              ) : (
                <StockRow key={a.id} article={a} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
