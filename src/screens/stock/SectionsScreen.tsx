import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, CupSoda } from "lucide-react";
import { useArticlesBySection } from "@/hooks/useData";

export default function StockSectionsScreen() {
  const navigate = useNavigate();
  const boutique = useArticlesBySection("boutique");
  const buvette = useArticlesBySection("buvette");

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-white px-8">
      <button
        onClick={() => navigate("/")}
        className="absolute left-8 top-8 flex h-12 w-12 items-center justify-center rounded-full text-usl-gray-dark transition-colors hover:bg-usl-gray hover:text-primary"
        aria-label="Retour"
      >
        <ArrowLeft strokeWidth={1.5} className="h-6 w-6" />
      </button>

      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des stocks</h1>
        <p className="mt-1.5 text-base text-muted-foreground">Choisis une section</p>
      </div>

      <div className="mt-20 grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
        <button
          onClick={() => navigate("/gestion/boutique")}
          className="flex flex-col items-center gap-4 rounded-2xl bg-primary px-8 py-12 text-primary-foreground transition-opacity active:opacity-90"
        >
          <ShoppingBag strokeWidth={1.5} className="h-9 w-9" />
          <div className="text-center">
            <div className="text-lg font-semibold">Boutique</div>
            <div className="mt-0.5 text-sm text-primary-foreground/70">
              {boutique.length} article{boutique.length > 1 ? "s" : ""}
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/gestion/buvette")}
          className="flex flex-col items-center gap-4 rounded-2xl border-2 border-primary bg-white px-8 py-12 text-primary transition-colors active:bg-usl-gray"
        >
          <CupSoda strokeWidth={1.5} className="h-9 w-9" />
          <div className="text-center">
            <div className="text-lg font-semibold">Buvette / Bar</div>
            <div className="mt-0.5 text-sm text-primary/60">
              {buvette.length} article{buvette.length > 1 ? "s" : ""}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
