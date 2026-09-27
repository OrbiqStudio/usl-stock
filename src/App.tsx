import { HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import HomeScreen from "@/screens/HomeScreen";
import StockSectionsScreen from "@/screens/stock/SectionsScreen";
import StockModeScreen from "@/screens/stock/StockModeScreen";
import DossiersScreen from "@/screens/stock/DossiersScreen";
import ArticlesScreen from "@/screens/stock/ArticlesScreen";
import PacksScreen from "@/screens/stock/PacksScreen";
import StockMatchDossiersScreen from "@/screens/stock/StockMatchDossiersScreen";
import StockMatchArticlesScreen from "@/screens/stock/StockMatchArticlesScreen";
import DirectPosteScreen from "@/screens/direct/DirectPosteScreen";
import CaisseScreen from "@/screens/direct/CaisseScreen";
import AdminScreen from "@/screens/admin/AdminScreen";
import { GlobalIdleOverlay } from "@/components/GlobalIdleOverlay";

function App() {
  return (
    <HashRouter>
      <GlobalIdleOverlay />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/gestion" element={<StockSectionsScreen />} />
        <Route path="/gestion/:section" element={<StockModeScreen />} />
        <Route path="/gestion/:section/produits" element={<DossiersScreen />} />
        <Route path="/gestion/:section/produits/packs" element={<PacksScreen />} />
        <Route path="/gestion/:section/produits/:dossierId" element={<ArticlesScreen />} />
        <Route path="/gestion/:section/stock" element={<StockMatchDossiersScreen />} />
        <Route path="/gestion/:section/stock/:dossierId" element={<StockMatchArticlesScreen />} />
        <Route path="/direct" element={<DirectPosteScreen />} />
        <Route path="/direct/:section" element={<CaisseScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </HashRouter>
  );
}

export default App;
