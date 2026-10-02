import { useNavigate } from "react-router-dom";
import { Package, Radio, Settings } from "lucide-react";
import { UslLogo } from "@/components/UslLogo";
import { useConfig } from "@/hooks/useData";

export default function HomeScreen() {
  const navigate = useNavigate();
  const config = useConfig();

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-white px-8">
      <button
        onClick={() => navigate("/admin")}
        className="absolute right-8 top-8 flex h-12 w-12 items-center justify-center rounded-full text-usl-gray-dark transition-colors hover:bg-usl-gray hover:text-primary"
        aria-label="Administration"
      >
        <Settings strokeWidth={1.5} className="h-6 w-6" />
      </button>

      <div className="flex flex-col items-center gap-5">
        <UslLogo size={88} />
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">USL Stock</h1>
          <p className="mt-1.5 text-base text-muted-foreground">{config.clubName}</p>
        </div>
      </div>

      <div className="mt-20 grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
        <button
          onClick={() => navigate("/gestion")}
          className="flex flex-col items-center gap-4 rounded-2xl bg-primary px-8 py-12 text-primary-foreground transition-opacity active:opacity-90"
        >
          <Package strokeWidth={1.5} className="h-9 w-9" />
          <div className="text-center">
            <div className="text-lg font-semibold">Gestion des stocks</div>
            <div className="mt-0.5 text-sm text-primary-foreground/70">Boutique &amp; buvette</div>
          </div>
        </button>

        <button
          onClick={() => navigate("/direct")}
          className="flex flex-col items-center gap-4 rounded-2xl border-2 border-primary bg-white px-8 py-12 text-primary transition-colors active:bg-usl-gray"
        >
          <Radio strokeWidth={1.5} className="h-9 w-9" />
          <div className="text-center">
            <div className="text-lg font-semibold">En direct</div>
            <div className="mt-0.5 text-sm text-primary/60">Caisse pendant le match</div>
          </div>
        </button>
      </div>
    </div>
  );
}
