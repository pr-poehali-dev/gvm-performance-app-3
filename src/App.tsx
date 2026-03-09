import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Finance from "@/pages/Finance";
import Trips from "@/pages/Trips";
import Owners from "@/pages/Owners";
import Parts from "@/pages/Parts";
import Stats from "@/pages/Stats";
import Intervals from "@/pages/Intervals";
import Documents from "@/pages/Documents";
import Settings from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" toastOptions={{
        style: { background: '#0d1a0d', border: '1px solid rgba(57,211,83,0.25)', color: '#e8f5e8' },
      }} />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/owners" element={<Owners />} />
            <Route path="/parts" element={<Parts />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/intervals" element={<Intervals />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;