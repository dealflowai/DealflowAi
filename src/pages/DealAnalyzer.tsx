
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PropertyScraper from '@/components/DealAnalyzer/PropertyScraper';
import DealAnalysis from '@/components/DealAnalyzer/DealAnalysis';
import DealPipeline from '@/components/DealAnalyzer/DealPipeline';
import DealStats from '@/components/DealAnalyzer/DealStats';
import { Search, Calculator, BarChart3, TrendingUp } from 'lucide-react';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  listPrice: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  daysOnMarket: number;
  propertyType: string;
  description: string;
  motivationScore: number;
  lat: number;
  lon: number;
}

const DealAnalyzer = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState('search');

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setActiveTab('analyze');
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deal Analyzer</h1>
          <p className="text-gray-600 mt-1">Find, analyze, and track wholesale real estate opportunities</p>
        </div>

        {/* Stats Overview */}
        <DealStats />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Property Search
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Deal Analysis
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <PropertyScraper 
              onPropertySelect={handlePropertySelect}
              selectedProperty={selectedProperty}
            />
          </TabsContent>

          <TabsContent value="analyze" className="space-y-6">
            <DealAnalysis property={selectedProperty} />
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <DealPipeline />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-500">Detailed analytics and reporting features will be available here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DealAnalyzer;
