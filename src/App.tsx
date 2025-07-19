
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { TokenProvider } from "@/contexts/TokenContext";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import AuthPage from "./components/Auth/AuthPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AuthWrapper from "./components/Auth/AuthWrapper";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import BuyerCRM from "./pages/BuyerCRM";
import DealAnalyzer from "./pages/DealAnalyzer";
import Contracts from "./pages/Contracts";
import Settings from "./pages/Settings";
import TokenPurchaseSuccess from "./pages/TokenPurchaseSuccess";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
import React from "react";
import { SkeletonCard } from "@/components/ui/skeleton-card";

// Lazy load heavy pages
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Analytics = lazy(() => import("./pages/Analytics"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Careers = lazy(() => import("./pages/Careers"));
const Help = lazy(() => import("./pages/Help"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const Community = lazy(() => import("./pages/Community"));


const queryClient = new QueryClient();

const AppContent = () => {
  const { isSignedIn, isLoaded } = useUser();
  useSupabaseSync();

  // Show loading while checking auth status
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-300">Loading...</span>
        </div>
      </div>
    );
  }

  const PageSkeleton = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route 
          path="/" 
          element={
            isSignedIn ? (
              <ProtectedRoute>
                <AuthWrapper>
                  <Dashboard />
                </AuthWrapper>
              </ProtectedRoute>
            ) : (
              <Landing />
            )
          }
        />
        <Route path="/buyers" element={
          <ProtectedRoute>
            <AuthWrapper>
              <BuyerCRM />
            </AuthWrapper>
          </ProtectedRoute>
        } />
        <Route path="/analyzer" element={
          <ProtectedRoute>
            <AuthWrapper>
              <DealAnalyzer />
            </AuthWrapper>
          </ProtectedRoute>
        } />
        <Route path="/contracts" element={
          <ProtectedRoute>
            <AuthWrapper>
              <Contracts />
            </AuthWrapper>
          </ProtectedRoute>
        } />
        <Route path="/marketplace" element={
          <ProtectedRoute>
            <AuthWrapper>
              <Suspense fallback={<PageSkeleton />}>
                <Marketplace />
              </Suspense>
            </AuthWrapper>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <AuthWrapper>
              <Suspense fallback={<PageSkeleton />}>
                <Analytics />
              </Suspense>
            </AuthWrapper>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AuthWrapper>
              <AdminDashboard />
            </AuthWrapper>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AuthWrapper>
              <Settings />
            </AuthWrapper>
          </ProtectedRoute>
        } />
        <Route path="/token-purchase-success" element={<TokenPurchaseSuccess />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/about" element={
          <Suspense fallback={<PageSkeleton />}>
            <About />
          </Suspense>
        } />
        <Route path="/contact" element={
          <Suspense fallback={<PageSkeleton />}>
            <Contact />
          </Suspense>
        } />
        <Route path="/careers" element={
          <Suspense fallback={<PageSkeleton />}>
            <Careers />
          </Suspense>
        } />
        <Route path="/help" element={
          <Suspense fallback={<PageSkeleton />}>
            <Help />
          </Suspense>
        } />
        <Route path="/api-docs" element={
          <Suspense fallback={<PageSkeleton />}>
            <ApiDocs />
          </Suspense>
        } />
        <Route path="/community" element={
          <Suspense fallback={<PageSkeleton />}>
            <Community />
          </Suspense>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <TokenProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </TokenProvider>
);

export default App;
