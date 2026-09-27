import { Package } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * Renders a category icon: a curated Lucide icon if `value` is a known key,
 * the raw emoji as text if it's a legacy value, or a generic package icon.
 */
export function DossierIcon({ value, className }: { value: string; className?: string }) {
  const Icon = CATEGORY_ICONS[value];
  if (Icon) return <Icon className={cn("h-5 w-5", className)} />;
  if (value) return <span className={cn("text-xl leading-none", className)}>{value}</span>;
  return <Package className={cn("h-5 w-5", className)} />;
}
