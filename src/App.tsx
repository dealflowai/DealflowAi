
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import { Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import AuthWrapper from '@/components/Auth/AuthWrapper';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import Landing from '@/pages/Landing';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import BuyerCRM from '@/pages/BuyerCRM';
import DealAnalyzer from '@/pages/DealAnalyzer';
import Contracts from '@/pages/Contracts';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import OnboardingTour from '@/components/Onboarding/OnboardingTour';
import { LazyMarketplace, LazyAnalytics, LazyBuyerPortal } from '@/components/Performance/LazyRoutes';
import { SkeletonCard } from '@/components/Performance/SkeletonCard';
import './App.css';

const queryClient = new QueryClient();

const PUBLISHABLE_KEY = "pk_test_ZW5kbGVzcy1tYXJtb3NldC00Ni5jbGVyay5hY2NvdW50cy5kZXYk";

function AppContent() {
  useSupabaseSync();

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthWrapper />} />
        <Route path="/portal" element={
          <Suspense fallback={<div className="p-8"><SkeletonCard /></div>}>
            <LazyBuyerPortal />
          </Suspense>
        } />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Index />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/buyers" element={<BuyerCRM />} />
          <Route path="/deals" element={<DealAnalyzer />} />
          <Route path="/marketplace" element={
            <Suspense fallback={<div className="p-8"><SkeletonCard /></div>}>
              <LazyMarketplace />
            </Suspense>
          } />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/analytics" element={
            <Suspense fallback={<div className="p-8"><SkeletonCard /></div>}>
              <LazyAnalytics />
            </Suspense>
          } />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <OnboardingTour />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
