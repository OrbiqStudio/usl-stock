import { useNavigate } from "react-router-dom";
import { ShoppingBag, CupSoda } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useArticlesBySection } from "@/hooks/useData";

function SectionCard({
  to,
  icon,
  title,
  subtitle,
  colorClass,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  colorClass: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
    >
      <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${colorClass}`}>
        {icon}
      </div>
      <div className="text-center">
        <div className="text-xl font-bold">{title}</div>
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      </div>
    </button>
  );
}

export default function StockSectionsScreen() {
  const navigate = useNavigate();
  const boutique = useArticlesBySection("boutique");
  const buvette = useArticlesBySection("buvette");

  return (
    <div className="flex h-screen w-screen flex-col bg-usl-gray">
      <ScreenHeader title="Gestion des stocks" onBack={() => navigate("/")} />
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <SectionCard
            to="/gestion/boutique"
            icon={<ShoppingBag className="h-10 w-10" />}
            title="Boutique"
            subtitle={`${boutique.length} article${boutique.length > 1 ? "s" : ""}`}
            colorClass="bg-usl-blue-light text-primary"
          />
          <SectionCard
            to="/gestion/buvette"
            icon={<CupSoda className="h-10 w-10" />}
            title="Buvette / Bar"
            subtitle={`${buvette.length} article${buvette.length > 1 ? "s" : ""}`}
            colorClass="bg-usl-warning-light text-usl-warning"
          />
        </div>
      </div>
    </div>
  );
}
