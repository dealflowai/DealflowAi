
import { lazy } from 'react';

// Lazy load heavy pages for better performance
export const LazyMarketplace = lazy(() => import('@/pages/Marketplace'));
export const LazyAnalytics = lazy(() => import('@/pages/Analytics'));
export const LazyBuyerPortal = lazy(() => import('@/pages/BuyerPortal'));
