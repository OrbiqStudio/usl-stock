import { doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Atomically increments a match's commande counter, safe across concurrent tablettes. */
export async function nextCommandeNumero(matchId: string): Promise<number> {
  const matchRef = doc(db, "matchs", matchId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(matchRef);
    if (!snap.exists()) throw new Error("Match introuvable");
    const current = (snap.data().compteurCommande as number) ?? 0;
    const next = current + 1;
    tx.update(matchRef, { compteurCommande: next, updatedAt: Date.now() });
    return next;
  });
}
