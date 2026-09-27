import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase Storage is intentionally not used — it now requires the paid
// Blaze plan even for free-tier usage. Images are kept out of it
// (see lib/storage.ts) so the project stays on the free Spark plan.
// The idle-mode video is a static public/veille.mp4 asset (see hooks/useVeilleVideo.ts).
const firebaseConfig = {
  apiKey: "AIzaSyDJl3kMOONJItYVRRnz0Tuok7n7jqfnk6Y",
  authDomain: "usl-stock.firebaseapp.com",
  projectId: "usl-stock",
  storageBucket: "usl-stock.firebasestorage.app",
  messagingSenderId: "325809991815",
  appId: "1:325809991815:web:325b73c96211f1aadbc822",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
