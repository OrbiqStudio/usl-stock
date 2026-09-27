import { Users } from "lucide-react";
import type { Commande } from "@/types";
import { cn } from "@/lib/utils";

const CHIP_COLORS = [
  "bg-usl-blue-light text-primary",
  "bg-usl-success-light text-success",
  "bg-usl-warning-light text-usl-warning",
  "bg-usl-danger-light text-destructive",
];

function elapsed(since: number): string {
  const s = Math.floor((Date.now() - since) / 1000);
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${m}min${String(rest).padStart(2, "0")}`;
}

/** Live view of in-progress orders on other tablettes, for the same match/section. */
export function OtherOrdersBar({ commandes }: { commandes: Commande[] }) {
  if (commandes.length === 0) return null;

  return (
    <div className="flex w-full flex-shrink-0 items-center gap-3 overflow-x-auto rounded-2xl border border-border bg-white px-4 py-3 no-scrollbar">
      <div className="flex flex-shrink-0 items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground">
        <Users className="h-4 w-4" />
        En cours ailleurs
      </div>
      {commandes.map((c, i) => (
        <div
          key={c.id}
          className={cn(
            "flex flex-shrink-0 items-center gap-2 rounded-full px-3 py-1.5",
            CHIP_COLORS[i % CHIP_COLORS.length]
          )}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-extrabold">
            {c.numero}
          </span>
          <span className="text-xs font-bold">Commande n°{c.numero}</span>
          <span className="text-[10px] opacity-80">{elapsed(c.createdAt)}</span>
        </div>
      ))}
    </div>
  );
}
