import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/Login";
import AlterarSenhaPage from "@/pages/AlterarSenha";
import DashboardPage from "@/pages/Dashboard";
import LinhasPage from "@/pages/Linhas";
import ChipsPage from "@/pages/Chips";
import DispositivosPage from "@/pages/Dispositivos";
import ColaboradoresPage from "@/pages/Colaboradores";
import PlanosPage from "@/pages/Planos";
import OperadorasPage from "@/pages/Operadoras";
import CustosPage from "@/pages/Custos";
import MovimentacoesPage from "@/pages/Movimentacoes";
import RelatoriosPage from "@/pages/Relatorios";
import ConfiguracoesPage from "@/pages/Configuracoes";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const raw = localStorage.getItem('user');
  if (!raw) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(raw);
    if (user.mustChangePassword) return <Navigate to="/alterar-senha" replace />;
  } catch { /* noop */ }
  return <AppLayout>{children}</AppLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/alterar-senha" element={<AlterarSenhaPage />} />
          <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/linhas" element={<RequireAuth><LinhasPage /></RequireAuth>} />
          <Route path="/chips" element={<RequireAuth><ChipsPage /></RequireAuth>} />
          <Route path="/dispositivos" element={<RequireAuth><DispositivosPage /></RequireAuth>} />
          <Route path="/colaboradores" element={<RequireAuth><ColaboradoresPage /></RequireAuth>} />
          <Route path="/planos" element={<RequireAuth><PlanosPage /></RequireAuth>} />
          <Route path="/operadoras" element={<RequireAuth><OperadorasPage /></RequireAuth>} />
          <Route path="/custos" element={<RequireAuth><CustosPage /></RequireAuth>} />
          <Route path="/movimentacoes" element={<RequireAuth><MovimentacoesPage /></RequireAuth>} />
          <Route path="/relatorios" element={<RequireAuth><RelatoriosPage /></RequireAuth>} />
          <Route path="/configuracoes" element={<RequireAuth><ConfiguracoesPage /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
