import {
  Package,
  CupSoda,
  Coffee,
  Beer,
  GlassWater,
  Sandwich,
  Pizza,
  UtensilsCrossed,
  Candy,
  Cookie,
  IceCream,
  Popcorn,
  Shirt,
  Gift,
  Ticket,
  Dumbbell,
  Trophy,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

/**
 * Curated icon set for stock categories (dossiers). Dossier.icone stores one of
 * these keys going forward. Older dossiers created before this system may still
 * hold a raw emoji string — DossierIcon (components/DossierIcon.tsx) falls back
 * to rendering that emoji as text so nothing breaks until the dossier is re-saved.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  boissons: CupSoda,
  chaud: Coffee,
  biere: Beer,
  eau: GlassWater,
  sandwich: Sandwich,
  pizza: Pizza,
  plats: UtensilsCrossed,
  confiserie: Candy,
  patisserie: Cookie,
  glace: IceCream,
  popcorn: Popcorn,
  vetements: Shirt,
  souvenirs: Gift,
  billetterie: Ticket,
  equipement: Dumbbell,
  trophees: Trophy,
  boutique: ShoppingBag,
  autre: Package,
};

export const CATEGORY_ICON_LABELS: Record<string, string> = {
  boissons: "Boissons fraîches",
  chaud: "Boissons chaudes",
  biere: "Bière",
  eau: "Eau",
  sandwich: "Sandwichs",
  pizza: "Pizza",
  plats: "Plats",
  confiserie: "Confiserie",
  patisserie: "Pâtisserie",
  glace: "Glaces",
  popcorn: "Snacks salés",
  vetements: "Vêtements",
  souvenirs: "Souvenirs",
  billetterie: "Billetterie",
  equipement: "Équipement",
  trophees: "Trophées",
  boutique: "Boutique",
  autre: "Autre",
};

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);

export function isKnownIconKey(value: string): boolean {
  return value in CATEGORY_ICONS;
}
