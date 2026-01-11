import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TechnicalAnalysis from "./pages/TechnicalAnalysis";
import LiveMarket from "./pages/LiveMarket";
import OIData from "./pages/OIData";
import EconomicCalendar from "./pages/EconomicCalendar";
import HolidayCalendar from "./pages/HolidayCalendar";
import MarketAnalysis from "./pages/MarketAnalysis";
import GlobalMarket from "./pages/GlobalMarket";
import OptionStrategies from "./pages/OptionStrategies";
import NotFound from "./pages/NotFound";
import DisclaimerModal from "./components/DisclaimerModal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DisclaimerModal />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TechnicalAnalysis />} />
          <Route path="/live-market" element={<LiveMarket />} />
          <Route path="/oi-data" element={<OIData />} />
          <Route path="/economic-calendar" element={<EconomicCalendar />} />
          <Route path="/holiday-calendar" element={<HolidayCalendar />} />
          <Route path="/market-analysis" element={<MarketAnalysis />} />
          <Route path="/global-market" element={<GlobalMarket />} />
          <Route path="/option-strategies" element={<OptionStrategies />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
