import { TriangleAlert, PackageX } from "lucide-react";

export function LowStockPopup({
  articleNom,
  stock,
  onClose,
}: {
  articleNom: string;
  stock: number;
  onClose: () => void;
}) {
  const rupture = stock <= 0;

  return (
    <div className="fixed left-1/2 top-6 z-[90] w-[90%] max-w-md -translate-x-1/2">
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-white shadow-lg ${
          rupture ? "bg-black" : "bg-usl-danger"
        }`}
      >
        {rupture ? (
          <PackageX className="h-7 w-7 flex-shrink-0" />
        ) : (
          <TriangleAlert className="h-6 w-6 flex-shrink-0" />
        )}
        <div className="flex-1 text-sm">
          <div className="font-bold">
            {rupture ? `RUPTURE — ${articleNom}` : `Stock bas — ${articleNom}`}
          </div>
          <div>{rupture ? "Plus aucun en stock" : `${stock} restant${stock > 1 ? "s" : ""}`}</div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-bold hover:bg-white/30"
        >
          OK
        </button>
      </div>
    </div>
  );
}
