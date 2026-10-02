import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Package, Minus, Plus } from "lucide-react";
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
    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-usl-gray">
      {article.imageUrl ? (
        <img src={article.imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <Package strokeWidth={1.5} className="h-6 w-6 text-muted-foreground" />
      )}
    </div>
  );
}

function QtyStepper({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  function step(delta: number) {
    onChange(String(Math.max(0, (parseInt(value, 10) || 0) + delta)));
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => step(-1)}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-usl-gray text-foreground transition-colors active:bg-slate-200"
        aria-label="Diminuer"
      >
        <Minus strokeWidth={1.75} className="h-4 w-4" />
      </button>
      <Input
        type="number"
        inputMode="numeric"
        className="w-14 border-0 bg-transparent p-0 text-center text-lg font-bold shadow-none [appearance:textfield] focus-visible:border-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        onClick={() => step(1)}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity active:opacity-90"
        aria-label="Augmenter"
      >
        <Plus strokeWidth={1.75} className="h-4 w-4" />
      </button>
    </div>
  );
}

function StockRow({ article }: { article: Article }) {
  const [value, setValue] = useState(String(article.stock));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) setValue(String(article.stock));
  }, [article.stock, dirty]);

  function commit(next?: string) {
    const n = Math.max(0, parseInt(next ?? value, 10) || 0);
    updateArticle(article.id, { stock: n });
    setValue(String(n));
    setDirty(false);
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4">
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
      <QtyStepper
        value={value}
        onChange={(v) => {
          setValue(v);
          setDirty(true);
          commit(v);
        }}
      />
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
    setDirty(false);
    toast.success(`Stock de "${article.nom}" mis à jour (${totalVerres} verres)`);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center gap-4">
        <ArticleThumb article={article} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{article.nom}</div>
          <div className="text-sm text-muted-foreground">
            {Object.entries(article.contenances)
              .map(([c, p]) => `${c} ${formatEuros(p ?? 0)}`)
              .join(" · ")}
          </div>
        </div>
        <div className="rounded-full bg-usl-blue-light px-4 py-2 text-center">
          <div className="text-lg font-extrabold leading-none text-primary">{totalVerres}</div>
          <div className="text-[10px] text-primary/70">verre{totalVerres > 1 ? "s" : ""}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3 border-t border-border pt-3">
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Bouteilles 1L (4 verres)</Label>
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
          <Label className="text-xs text-muted-foreground">Bouteilles 1,5L (6 verres)</Label>
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
        <Button variant={dirty ? "success" : "secondary"} className="rounded-full" onClick={save}>
          Enregistrer
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
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-white text-center">
        <h2 className="text-2xl font-bold">Aucun match en cours</h2>
        <button onClick={() => navigate(`/gestion/${sec}`)} className="text-primary underline">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-white">
      <ScreenHeader
        title={dossier ? dossier.nom : "Articles"}
        subtitle={`Stock — ${activeMatch.nom}`}
        onBack={() => navigate(`/gestion/${sec}/stock`)}
      />

      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
        {articles.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <Package strokeWidth={1.5} className="h-12 w-12 opacity-40" />
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
