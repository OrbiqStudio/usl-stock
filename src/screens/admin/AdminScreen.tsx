import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminPasswordGate } from "@/screens/admin/AdminPasswordGate";
import { AdminDashboard } from "@/screens/admin/AdminDashboard";
import { AdminMatchsTab } from "@/screens/admin/AdminMatchsTab";
import { AdminParametresTab } from "@/screens/admin/AdminParametresTab";
import { AdminExportTab } from "@/screens/admin/AdminExportTab";

export default function AdminScreen() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("usl-stock:admin-auth") === "1"
  );

  function handleLogout() {
    sessionStorage.removeItem("usl-stock:admin-auth");
    setAuthenticated(false);
  }

  if (!authenticated) {
    return <AdminPasswordGate onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-usl-gray">
      <ScreenHeader
        title="Administration"
        onBack={() => navigate("/")}
        right={
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Déconnexion
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="matchs">Matchs</TabsTrigger>
            <TabsTrigger value="parametres">Paramètres</TabsTrigger>
            <TabsTrigger value="export">Export Excel</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          <TabsContent value="matchs">
            <AdminMatchsTab />
          </TabsContent>
          <TabsContent value="parametres">
            <AdminParametresTab />
          </TabsContent>
          <TabsContent value="export">
            <AdminExportTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
