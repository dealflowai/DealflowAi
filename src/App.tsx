
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider, useUser } from "@clerk/clerk-react";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AuthPage from "./components/Auth/AuthPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import BuyerCRM from "./pages/BuyerCRM";
import DealAnalyzer from "./pages/DealAnalyzer";
import Contracts from "./pages/Contracts";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
import { SkeletonCard } from "@/components/ui/skeleton-card";

// Lazy load heavy pages
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Analytics = lazy(() => import("./pages/Analytics"));

const PUBLISHABLE_KEY = "pk_test_ZW5kbGVzcy1tYXJtb3NldC00Ni5jbGVyay5hY2NvdW50cy5kZXYk";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

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
                <Dashboard />
              </ProtectedRoute>
            ) : (
              <Landing />
            )
          } 
        />
        <Route path="/buyers" element={
          <ProtectedRoute>
            <BuyerCRM />
          </ProtectedRoute>
        } />
        <Route path="/analyzer" element={
          <ProtectedRoute>
            <DealAnalyzer />
          </ProtectedRoute>
        } />
        <Route path="/contracts" element={
          <ProtectedRoute>
            <Contracts />
          </ProtectedRoute>
        } />
        <Route path="/marketplace" element={
          <ProtectedRoute>
            <Suspense fallback={<PageSkeleton />}>
              <Marketplace />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Suspense fallback={<PageSkeleton />}>
              <Analytics />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
