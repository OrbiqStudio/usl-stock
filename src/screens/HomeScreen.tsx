import { useNavigate } from "react-router-dom";
import { Package, Radio, Settings } from "lucide-react";
import { UslLogo } from "@/components/UslLogo";
import { useConfig } from "@/hooks/useData";

export default function HomeScreen() {
  const navigate = useNavigate();
  const config = useConfig();

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-usl-gray px-8">
      <button
        onClick={() => navigate("/admin")}
        className="absolute right-6 top-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-usl-gray-dark shadow-sm transition-colors hover:bg-usl-blue-light hover:text-primary"
        aria-label="Administration"
      >
        <Settings className="h-7 w-7" />
      </button>

      <div className="flex flex-col items-center gap-4">
        <UslLogo size={96} />
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-primary">USL Stock</h1>
          <p className="mt-1 text-lg text-muted-foreground">{config.clubName}</p>
        </div>
      </div>

      <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        <button
          onClick={() => navigate("/gestion")}
          className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-usl-blue-light text-primary">
            <Package className="h-10 w-10" />
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">Gestion des stocks</div>
            <div className="text-sm text-muted-foreground">Boutique &amp; buvette</div>
          </div>
        </button>

        <button
          onClick={() => navigate("/direct")}
          className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-usl-danger-light text-usl-danger">
            <Radio className="h-10 w-10" />
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">En direct</div>
            <div className="text-sm text-muted-foreground">Caisse pendant le match</div>
          </div>
        </button>
      </div>
    </div>
  );
}
