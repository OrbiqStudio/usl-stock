import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  increment,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Listener = () => void;

interface WithId {
  id: string;
}

/**
 * Firestore-backed collection exposing a synchronous getAll/get + subscribe
 * interface (via a local cache kept in sync through onSnapshot), so the
 * business logic in lib/data.ts and every screen can consume it like a
 * plain in-memory store.
 */
export class FirestoreCollection<T extends WithId> {
  private name: string;
  private cache: T[] = [];
  private ready = false;
  private listeners = new Set<Listener>();

  constructor(name: string) {
    this.name = name;
    onSnapshot(collection(db, name), (snapshot) => {
      this.cache = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
      this.ready = true;
      this.emit();
    });
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  getAll(): T[] {
    return this.cache;
  }

  get(id: string): T | undefined {
    return this.cache.find((i) => i.id === id);
  }

  isReady(): boolean {
    return this.ready;
  }

  add(item: T) {
    const { id, ...rest } = item;
    void setDoc(doc(db, this.name, id), rest as DocumentData);
  }

  update(id: string, patch: Partial<T>) {
    void updateDoc(doc(db, this.name, id), patch as DocumentData);
  }

  remove(id: string) {
    void deleteDoc(doc(db, this.name, id));
  }

  /** Atomic server-side increment — safe against concurrent writes from other tablettes. */
  incrementField(id: string, field: keyof T & string, delta: number) {
    void updateDoc(doc(db, this.name, id), { [field]: increment(delta) } as DocumentData);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
