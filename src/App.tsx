import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { SplashScreen } from "./components/SplashScreen";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NewBooking from "./pages/NewBooking";
import Rentals from "./pages/Rentals";
import Vehicles from "./pages/Vehicles";
import Invoice from "./pages/Invoice";
import Login from "./pages/Login";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";
import Install from "./pages/Install";

const queryClient = new QueryClient();

const App = () => {
  // Check localStorage to skip splash on return visits
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = localStorage.getItem('yousif_sons_splash_seen');
    return !hasSeenSplash;
  });

  const handleSplashComplete = () => {
    localStorage.setItem('yousif_sons_splash_seen', 'true');
    setShowSplash(false);
  };

  // Don't render app until splash is complete
  if (showSplash) {
    return (
      <QueryClientProvider client={queryClient}>
        <SplashScreen onComplete={handleSplashComplete} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/new-booking" element={
                  <ProtectedRoute>
                    <NewBooking />
                  </ProtectedRoute>
                } />
                <Route path="/vehicles" element={
                  <ProtectedRoute>
                    <Vehicles />
                  </ProtectedRoute>
                } />
                <Route path="/rentals" element={
                  <ProtectedRoute>
                    <Rentals />
                  </ProtectedRoute>
                } />
                <Route path="/invoice/:id" element={
                  <ProtectedRoute>
                    <Invoice />
                  </ProtectedRoute>
                } />
                <Route path="/agreement/:id" element={
                  <ProtectedRoute>
                    <Invoice />
                  </ProtectedRoute>
                } />
                
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/install" element={<Install />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="*" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
