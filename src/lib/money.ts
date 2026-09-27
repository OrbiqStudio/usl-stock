/** All monetary amounts are stored as integer cents to avoid float rounding issues. */

export function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

export function centsToEuros(cents: number): number {
  return cents / 100;
}

/** Splits a TTC amount into HT + TVA given a VAT rate (e.g. 20 for 20%). */
export function ttcToHt(ttcCents: number, tauxTVA: number): { ht: number; tva: number } {
  const ht = Math.round(ttcCents / (1 + tauxTVA / 100));
  const tva = ttcCents - ht;
  return { ht, tva };
}
