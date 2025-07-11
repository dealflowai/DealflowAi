
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { TokenProvider } from '@/contexts/TokenContext';

// Clerk publishable key
const PUBLISHABLE_KEY = "pk_test_ZW5kbGVzcy1tYXJtb3NldC00Ni5jbGVyay5hY2NvdW50cy5kZXYk";

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
