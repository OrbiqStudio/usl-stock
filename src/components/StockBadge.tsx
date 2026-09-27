import { Badge } from "@/components/ui/badge";

export function StockBadge({ stock, seuilAlerte }: { stock: number; seuilAlerte: number }) {
  if (stock === 0) {
    return <Badge variant="destructive">Rupture</Badge>;
  }
  if (stock <= seuilAlerte) {
    return <Badge variant="warning">{stock} restant{stock > 1 ? "s" : ""}</Badge>;
  }
  return <Badge variant="success">{stock} en stock</Badge>;
}
