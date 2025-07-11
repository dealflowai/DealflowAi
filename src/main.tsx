
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { TokenProvider } from '@/contexts/TokenContext';

// TODO: Replace with your actual Clerk publishable key
const PUBLISHABLE_KEY = "pk_test_your_key_here";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <TokenProvider>
      <App />
    </TokenProvider>
  </ClerkProvider>
);
