
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import BuyerCRM from './pages/BuyerCRM';
import DealAnalyzer from './pages/DealAnalyzer';
import Marketplace from './pages/Marketplace';
import Contracts from './pages/Contracts';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import AuthWrapper from './components/Auth/AuthWrapper';
import OnboardingTour from './components/Onboarding/OnboardingTour';

const queryClient = new QueryClient();

const CLERK_PUBLISHABLE_KEY = 'pk_test_ZW5kbGVzcy1tYXJtb3NldC00Ni5jbGVyay5hY2NvdW50cy5kZXYk';

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/dashboard"
                element={
                  <AuthWrapper>
                    <Dashboard />
                  </AuthWrapper>
                }
              />
              <Route
                path="/buyers"
                element={
                  <AuthWrapper>
                    <BuyerCRM />
                  </AuthWrapper>
                }
              />
              <Route
                path="/deals"
                element={
                  <AuthWrapper>
                    <DealAnalyzer />
                  </AuthWrapper>
                }
              />
              <Route
                path="/marketplace"
                element={
                  <AuthWrapper>
                    <Marketplace />
                  </AuthWrapper>
                }
              />
              <Route
                path="/contracts"
                element={
                  <AuthWrapper>
                    <Contracts />
                  </AuthWrapper>
                }
              />
              <Route
                path="/analytics"
                element={
                  <AuthWrapper>
                    <Analytics />
                  </AuthWrapper>
                }
              />
              <Route
                path="/settings"
                element={
                  <AuthWrapper>
                    <Settings />
                  </AuthWrapper>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <OnboardingTour />
            <Toaster />
          </div>
        </Router>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
