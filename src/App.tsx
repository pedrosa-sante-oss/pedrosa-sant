import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";
import LocadorLayout from "@/layouts/LocadorLayout";

// Public pages
import Index from "./pages/Index";
import Espacos from "./pages/Espacos";
import ParaVoce from "./pages/ParaVoce";
import Contato from "./pages/Contato";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminConteudo from "./pages/admin/AdminConteudo";
import AdminSalas from "./pages/admin/AdminSalas";
import AdminLocadores from "./pages/admin/AdminLocadores";
import AdminAgenda from "./pages/admin/AdminAgenda";
import AdminReservas from "./pages/admin/AdminReservas";
import AdminFinanceiro from "./pages/admin/AdminFinanceiro";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";

// Tenant (locador) pages
import LocadorLogin from "./pages/locador/LocadorLogin";
import ConviteCadastro from "./pages/locador/ConviteCadastro";
import LocadorAgenda from "./pages/locador/LocadorAgenda";
import LocadorReservas from "./pages/locador/LocadorReservas";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/espacos" element={<Espacos />} />
            <Route path="/para-voce" element={<ParaVoce />} />
            <Route path="/contato" element={<Contato />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="salas" element={<AdminSalas />} />
            <Route path="agenda" element={<AdminAgenda />} />
            <Route path="reservas" element={<AdminReservas />} />
            <Route path="locadores" element={<AdminLocadores />} />
            <Route path="financeiro" element={<AdminFinanceiro />} />
            <Route path="conteudo" element={<AdminConteudo />} />
            <Route path="configuracoes" element={<AdminConfiguracoes />} />
          </Route>

          {/* Locador portal */}
          <Route path="/locador/login" element={<LocadorLogin />} />
          <Route path="/convite/:token" element={<ConviteCadastro />} />
          <Route path="/locador" element={<LocadorLayout />}>
            <Route index element={<Navigate to="/locador/agenda" replace />} />
            <Route path="agenda" element={<LocadorAgenda />} />
            <Route path="reservas" element={<LocadorReservas />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
