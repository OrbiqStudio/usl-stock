import { CATEGORY_ICON_KEYS, CATEGORY_ICON_LABELS } from "@/lib/icons";
import { DossierIcon } from "@/components/DossierIcon";
import { cn } from "@/lib/utils";

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {CATEGORY_ICON_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          title={CATEGORY_ICON_LABELS[key]}
          onClick={() => onChange(key)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 text-center transition-colors",
            value === key
              ? "border-primary bg-usl-blue-light text-primary"
              : "border-transparent bg-usl-gray text-usl-gray-dark hover:border-border"
          )}
        >
          <DossierIcon value={key} className="h-5 w-5" />
          <span className="line-clamp-2 text-[10px] font-semibold leading-tight">
            {CATEGORY_ICON_LABELS[key]}
          </span>
        </button>
      ))}
    </div>
  );
}
