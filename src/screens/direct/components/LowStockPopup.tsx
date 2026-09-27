import { TriangleAlert } from "lucide-react";

export function LowStockPopup({
  articleNom,
  stock,
  onClose,
}: {
  articleNom: string;
  stock: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed left-1/2 top-6 z-[90] w-[90%] max-w-md -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl bg-usl-danger px-4 py-3 text-white shadow-lg">
        <TriangleAlert className="h-6 w-6 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <div className="font-bold">Stock bas — {articleNom}</div>
          <div>{stock} restant{stock > 1 ? "s" : ""}</div>
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
