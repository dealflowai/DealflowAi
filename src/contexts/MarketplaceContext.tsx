
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Deal {
  id: number;
  title: string;
  address: string;
  price: number;
  arv: number;
  roiEstimate: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  repairEstimate: number;
  daysOnMarket: number;
  dealType: string;
  type: string;
  poster: string;
  posterRating: number;
}

interface BuyerCriteria {
  id: string;
  buyer: string;
  budget: string;
  type: string;
  location: string;
  preferredAreas: string[];
  buyerRating: number;
  dealsClosed: number;
}

interface SavedSearch {
  id: string;
  name: string;
  criteria: {
    searchTerm: string;
    priceRange: [number, number];
    states: string[];
    types: string[];
    minROI?: number;
  };
  alertsEnabled: boolean;
  createdAt: string;
  lastRun: string;
  newResultsCount: number;
}

interface MarketplaceContextType {
  deals: Deal[];
  filteredDeals: Deal[];
  buyers: BuyerCriteria[];
  savedSearches: SavedSearch[];
  comparisonDeals: Deal[];
  searchCriteria: any;
  selectedDeals: number[];
  isAutoRefreshEnabled: boolean;
  setDeals: (deals: Deal[]) => void;
  setFilteredDeals: (deals: Deal[]) => void;
  setBuyers: (buyers: BuyerCriteria[]) => void;
  setSavedSearches: (searches: SavedSearch[]) => void;
  addToComparison: (deal: Deal) => void;
  removeFromComparison: (dealId: number) => void;
  clearComparison: () => void;
  updateSearchCriteria: (criteria: any) => void;
  toggleDealSelection: (dealId: number) => void;
  runAutomatedMatching: () => void;
  setAutoRefreshEnabled: (enabled: boolean) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [buyers, setBuyers] = useState<BuyerCriteria[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [comparisonDeals, setComparisonDeals] = useState<Deal[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<any>({});
  const [selectedDeals, setSelectedDeals] = useState<number[]>([]);
  const [isAutoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Auto-refresh functionality
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;

    const interval = setInterval(() => {
      runAutomatedMatching();
      updateSavedSearchAlerts();
    }, 30000); // Run every 30 seconds

    return () => clearInterval(interval);
  }, [isAutoRefreshEnabled, savedSearches]);

  const addToComparison = (deal: Deal) => {
    if (comparisonDeals.length >= 5) return; // Max 5 deals for comparison
    if (!comparisonDeals.find(d => d.id === deal.id)) {
      setComparisonDeals(prev => [...prev, deal]);
    }
  };

  const removeFromComparison = (dealId: number) => {
    setComparisonDeals(prev => prev.filter(d => d.id !== dealId));
  };

  const clearComparison = () => {
    setComparisonDeals([]);
  };

  const updateSearchCriteria = (criteria: any) => {
    setSearchCriteria(criteria);
    // Auto-apply filters when criteria changes
    applyFilters(criteria);
  };

  const applyFilters = (criteria: any) => {
    let filtered = [...deals];

    if (criteria.searchTerm) {
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(criteria.searchTerm.toLowerCase()) ||
        deal.address.toLowerCase().includes(criteria.searchTerm.toLowerCase())
      );
    }

    if (criteria.priceRange) {
      filtered = filtered.filter(deal => 
        deal.price >= criteria.priceRange[0] && deal.price <= criteria.priceRange[1]
      );
    }

    if (criteria.minROI) {
      filtered = filtered.filter(deal => deal.roiEstimate >= criteria.minROI);
    }

    if (criteria.types && criteria.types.length > 0) {
      filtered = filtered.filter(deal => criteria.types.includes(deal.type));
    }

    setFilteredDeals(filtered);
  };

  const toggleDealSelection = (dealId: number) => {
    setSelectedDeals(prev => 
      prev.includes(dealId) 
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    );
  };

  const runAutomatedMatching = () => {
    // This will trigger the AI matching engine to recalculate matches
    console.log('Running automated deal matching...');
    // The actual matching logic is handled by the DealMatchingEngine component
  };

  const updateSavedSearchAlerts = () => {
    setSavedSearches(prev => prev.map(search => {
      if (!search.alertsEnabled) return search;
      
      // Simulate finding new results
      const matchingDeals = deals.filter(deal => {
        if (search.criteria.searchTerm && !deal.title.toLowerCase().includes(search.criteria.searchTerm.toLowerCase())) {
          return false;
        }
        if (deal.price < search.criteria.priceRange[0] || deal.price > search.criteria.priceRange[1]) {
          return false;
        }
        if (search.criteria.minROI && deal.roiEstimate < search.criteria.minROI) {
          return false;
        }
        return true;
      });

      const newResultsCount = Math.max(0, matchingDeals.length - (search.newResultsCount || 0));
      
      return {
        ...search,
        lastRun: new Date().toISOString().split('T')[0],
        newResultsCount: newResultsCount > 0 ? Math.floor(Math.random() * 3) + 1 : 0
      };
    }));
  };

  const value = {
    deals,
    filteredDeals,
    buyers,
    savedSearches,
    comparisonDeals,
    searchCriteria,
    selectedDeals,
    isAutoRefreshEnabled,
    setDeals,
    setFilteredDeals,
    setBuyers,
    setSavedSearches,
    addToComparison,
    removeFromComparison,
    clearComparison,
    updateSearchCriteria,
    toggleDealSelection,
    runAutomatedMatching,
    setAutoRefreshEnabled
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
