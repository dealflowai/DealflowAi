
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TokenProvider } from '@/contexts/TokenContext';

createRoot(document.getElementById("root")!).render(
  <TokenProvider>
    <App />
  </TokenProvider>
);
