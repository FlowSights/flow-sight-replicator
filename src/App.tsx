import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AIChatbot } from "@/components/AIChatbot";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Privacy from "./pages/Privacy.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import DiagnosticQuiz from "./pages/DiagnosticQuiz.tsx";
import Auth from "./pages/Auth.tsx";
import FlowsightAdsLanding from "./pages/FlowsightAdsLanding";
import FlowsightAdsDashboard from "./pages/FlowsightAdsDashboard";
import ResetPassword from "./pages/ResetPassword";
import { supabase } from "./lib/supabaseClient";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/privacidad" element={<Privacy />} />
                <Route path="/diagnostico" element={<DiagnosticQuiz />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/flowsight-ads" element={<FlowsightAdsLanding />} />
                <Route path="/flowsight-ads/dashboard" element={<FlowsightAdsDashboard />} />
                <Route path="/auth/callback" element={<ResetPassword />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              {/* AI Chatbot disponible globalmente en todas las páginas */}
              <AIChatbot />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
  );
};

export default App;
