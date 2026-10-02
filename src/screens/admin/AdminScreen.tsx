import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Settings2, FileSpreadsheet, LogOut, Home } from "lucide-react";
import { FloatingDock, type DockItem } from "@/components/ui/floating-dock";
import { AdminPasswordGate } from "@/screens/admin/AdminPasswordGate";
import { AdminDashboard } from "@/screens/admin/AdminDashboard";
import { AdminMatchsTab } from "@/screens/admin/AdminMatchsTab";
import { AdminParametresTab } from "@/screens/admin/AdminParametresTab";
import { AdminExportTab } from "@/screens/admin/AdminExportTab";

type Section = "dashboard" | "matchs" | "parametres" | "export";

const NAV: { key: Section; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { key: "matchs", label: "Matchs", icon: CalendarDays },
  { key: "parametres", label: "Paramètres", icon: Settings2 },
  { key: "export", label: "Export Excel", icon: FileSpreadsheet },
];

export default function AdminScreen() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("usl-stock:admin-auth") === "1"
  );
  const [section, setSection] = useState<Section>("dashboard");

  function handleLogout() {
    sessionStorage.removeItem("usl-stock:admin-auth");
    setAuthenticated(false);
  }

  if (!authenticated) {
    return <AdminPasswordGate onSuccess={() => setAuthenticated(true)} />;
  }

  const active = NAV.find((n) => n.key === section)!;

  const dockItems: DockItem[] = [
    ...NAV.map((item) => ({
      title: item.label,
      icon: <item.icon className="h-full w-full" strokeWidth={1.75} />,
      onClick: () => setSection(item.key),
      active: item.key === section,
    })),
    {
      title: "Retour à l'accueil",
      icon: <Home className="h-full w-full" strokeWidth={1.75} />,
      onClick: () => navigate("/"),
    },
    {
      title: "Déconnexion",
      icon: <LogOut className="h-full w-full" strokeWidth={1.75} />,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="relative flex h-screen w-screen flex-col bg-usl-gray">
      <header className="flex items-center px-8 py-6">
        <h1 className="text-2xl font-bold tracking-tight">{active.label}</h1>
      </header>
      <div className="flex-1 overflow-y-auto px-8 pb-28">
        {section === "dashboard" && <AdminDashboard />}
        {section === "matchs" && <AdminMatchsTab />}
        {section === "parametres" && <AdminParametresTab />}
        {section === "export" && <AdminExportTab />}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <div className="pointer-events-auto">
          <FloatingDock items={dockItems} />
        </div>
      </div>
    </div>
  );
}
