
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import StatsCard from '@/components/Dashboard/StatsCard';
import RecentActivity from '@/components/Dashboard/RecentActivity';
import AdvancedCharts from '@/components/Dashboard/AdvancedCharts';
import OnboardingPrompts from '@/components/Dashboard/OnboardingPrompts';
import QuickActions from '@/components/Dashboard/QuickActions';
import DealBuyerSnapshot from '@/components/Dashboard/DealBuyerSnapshot';

import GuidedTour from '@/components/Onboarding/GuidedTour';
import { Users, Calculator, FileText, DollarSign, TrendingUp, Target, Lightbulb, Plus, Bot, Gem, BarChart3, Activity, Award, Zap, Gauge } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { NotificationService } from '@/services/notificationService';
import { useTokens } from '@/contexts/TokenContext';
import { TokenPricingModal } from '@/components/ui/token-pricing-modal';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Export functionality
const exportDashboardReport = (stats: any, trends: any, activities: any[], user: any, toast: any) => {
  const reportData = {
    generatedAt: new Date().toLocaleString(),
    user: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.emailAddresses?.[0]?.emailAddress || 'Unknown User',
    
    // Key Metrics
    totalBuyers: stats.totalBuyers,
    activeBuyers: stats.activeBuyers,
    newBuyers: stats.newBuyers,
    totalDeals: stats.totalDeals,
    activeDeals: stats.activeDeals,
    closedDeals: stats.closedDeals,
    totalContracts: stats.totalContracts,
    signedContracts: stats.signedContracts,
    
    // Financial Metrics
    totalBuyingPower: stats.totalBuyingPower,
    averageBudget: stats.averageBudget,
    averageDealValue: stats.averageDealValue,
    totalDealValue: stats.totalDealValue,
    
    // Performance Metrics
    activationRate: trends.activationRate.toFixed(2) + '%',
    conversionRate: trends.conversionRate.toFixed(2) + '%',
    buyersGrowth: trends.buyersGrowth.toFixed(2) + '%',
    
    // Token Usage
    totalTokens: stats.totalTokens,
    usedTokens: stats.usedTokens,
    remainingTokens: stats.remainingTokens,
    
    // Recent Activity Summary
    recentActivityCount: activities.length,
    recentActivity: activities.slice(0, 10).map(activity => ({
      type: activity.type,
      title: activity.title,
      description: activity.description,
      time: activity.time
    }))
  };

  // Convert to CSV format
  const csvContent = generateCSVReport(reportData);
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `dealflow-dashboard-report-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Show success toast
  toast({
    title: "Report Exported Successfully",
    description: "Your dashboard report has been downloaded as a CSV file.",
  });
};

const generateCSVReport = (data: any) => {
  const lines = [
    'DealFlow AI - Dashboard Report',
    `Generated: ${data.generatedAt}`,
    `User: ${data.user}`,
    '',
    'KEY METRICS',
    `Total Buyers,${data.totalBuyers}`,
    `Active Buyers,${data.activeBuyers}`,
    `New Buyers,${data.newBuyers}`,
    `Total Deals,${data.totalDeals}`,
    `Active Deals,${data.activeDeals}`,
    `Closed Deals,${data.closedDeals}`,
    `Total Contracts,${data.totalContracts}`,
    `Signed Contracts,${data.signedContracts}`,
    '',
    'FINANCIAL METRICS',
    `Total Buying Power,$${data.totalBuyingPower.toLocaleString()}`,
    `Average Budget,$${data.averageBudget.toLocaleString()}`,
    `Average Deal Value,$${data.averageDealValue.toLocaleString()}`,
    `Total Deal Value,$${data.totalDealValue.toLocaleString()}`,
    '',
    'PERFORMANCE METRICS',
    `Activation Rate,${data.activationRate}`,
    `Conversion Rate,${data.conversionRate}`,
    `Buyers Growth,${data.buyersGrowth}`,
    '',
    'TOKEN USAGE',
    `Total Tokens,${data.totalTokens}`,
    `Used Tokens,${data.usedTokens}`,
    `Remaining Tokens,${data.remainingTokens}`,
    '',
    'RECENT ACTIVITY',
    'Type,Title,Description,Time',
    ...data.recentActivity.map((activity: any) => 
      `${activity.type},"${activity.title}","${activity.description}",${activity.time}`
    )
  ];
  
  return lines.join('\n');
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { stats, trends, recentActivity, buyerChartData, marketInsights, isLoading } = useDashboardData();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { tokenBalance, loading: tokenLoading } = useTokens();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  
  const { toast } = useToast();


  // Check if user has completed onboarding
  const { data: hasCompletedOnboarding } = useQuery({
    queryKey: ['onboarding', user?.id],
    queryFn: async () => {
      if (!user?.id) return true;
      
      const localFlag = localStorage.getItem('hasCompletedOnboard');
      if (localFlag === 'true') return true;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('clerk_id', user.id)
        .single();
      
      if (error) {
        console.log('Profile not found or missing onboarding field:', error.message);
        return false;
      }
      
      return data?.has_completed_onboarding || false;
    },
    enabled: !!user?.id,
  });

  // Fetch fresh insights
  const { data: insights } = useQuery({
    queryKey: ['insights', user?.id],
    queryFn: async () => {
      // Mock fresh insights - in real app this would be a Supabase RPC
      return [
        {
          id: 1,
          type: 'opportunity',
          title: 'New Market Opportunity',
          description: '3 new cash buyers discovered in your target markets',
          action: 'View Buyers',
          actionUrl: '/buyers'
        },
        {
          id: 2,
          type: 'insight',
          title: 'AI Deal Analysis',
          description: 'Average deal score increased by 12% this week',
          action: 'View Analytics',
          actionUrl: '/analytics'
        }
      ];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (hasCompletedOnboarding === false) {
      setShowOnboarding(true);
    }
  }, [hasCompletedOnboarding]);

  // Check for welcome tour
  useEffect(() => {
    const shouldShowWelcome = localStorage.getItem('showWelcomeTour');
    if (shouldShowWelcome === 'true' && hasCompletedOnboarding) {
      localStorage.removeItem('showWelcomeTour');
      setShowWelcomeTour(true);
      
      // Show welcome toast
      setTimeout(() => {
        toast({
          title: "🎉 Welcome to DealFlow AI!",
          description: "Let's take a quick tour to show you around the platform.",
          duration: 5000,
        });
      }, 1000);
    }
  }, [hasCompletedOnboarding, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            
            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            
            {/* Secondary stats skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i + 4} />
              ))}
            </div>
            
            {/* Content area skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 animate-pulse"></div>
              <div className="lg:col-span-2 bg-gray-200 dark:bg-gray-700 rounded-xl h-64 animate-pulse"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Welcome back, {user?.firstName || 'User'}. Here's your dealflow overview.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={() => exportDashboardReport(stats, trends, recentActivity, user, toast)}
              data-tour="contracts" 
              className="text-xs sm:text-sm"
            >
              Export Report
            </Button>
            <Button 
              onClick={() => navigate('/analyzer')}
              className="bg-primary hover:bg-primary/90 text-xs sm:text-sm"
              data-tour="deal-analyzer"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              New Deal
            </Button>
          </div>
        </div>

        {/* Token Warning Banner */}
        {!tokenLoading && tokenBalance && tokenBalance.remainingTokens < 10 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-3 sm:p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <div className="flex items-start sm:items-center space-x-3">
                <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400 mt-1 sm:mt-0" />
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 text-sm sm:text-base">
                    {tokenBalance.remainingTokens === 0 ? 'No Tokens Remaining' : 'Low Token Balance'}
                  </h3>
                  <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">
                    {tokenBalance.remainingTokens === 0 
                      ? 'Recharge to continue using AI features' 
                      : `Only ${tokenBalance.remainingTokens} tokens left. AI features will be limited soon.`
                    }
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setTokenModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm w-full sm:w-auto"
                size="sm"
              >
                <Gem className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                {tokenBalance.remainingTokens === 0 ? 'Recharge Now' : 'Buy Tokens'}
              </Button>
            </div>
          </div>
        )}


        {/* Fresh Insights Card */}
        {insights && insights.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3 mb-3">
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">Fresh Insights</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {insights.map((insight) => (
                <div key={insight.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                  <h4 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 mb-1">{insight.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{insight.description}</p>
                  <Button 
                    onClick={() => navigate(insight.actionUrl)}
                    variant="outline" 
                    size="sm" 
                    className="text-xs w-full sm:w-auto"
                  >
                    {insight.action}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Stats Grid */}
        <ErrorBoundary>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <StatsCard
              title="Total Buyers"
              value={stats.totalBuyers}
              change={trends.buyersGrowth > 0 ? `+${trends.buyersGrowth.toFixed(1)}% growth` : `${stats.newBuyers} new this month`}
              changeType={trends.buyersGrowth > 0 ? "positive" : "neutral"}
              icon={Users}
              data-tour="buyers-cta"
              trend={{ percentage: trends.buyersGrowth, period: "vs last month" }}
              tooltip="Total number of buyers in your pipeline. Includes active, inactive, and prospect buyers."
            />
            <StatsCard
              title="Active Deals"
              value={stats.activeDeals}
              change={`${stats.totalDeals} total deals`}
              changeType="positive"
              icon={Calculator}
              trend={{ percentage: 12.5, period: "vs last week" }}
              tooltip="Deals currently being analyzed or in negotiation phase."
            />
            <StatsCard
              title="Buying Power"
              value={`$${(stats.totalBuyingPower / 1000000).toFixed(1)}M`}
              change={`Avg: $${stats.averageBudget.toLocaleString()}`}
              changeType="positive"
              icon={DollarSign}
              gradient={true}
              trend={{ percentage: 8.3, period: "vs last month" }}
              tooltip="Total combined buying power of all active buyers in your pipeline."
            />
            <StatsCard
              title="Conversion Rate"
              value={`${trends.conversionRate.toFixed(1)}%`}
              change={`${stats.closedDeals} closed deals`}
              changeType={trends.conversionRate > 0 ? "positive" : "neutral"}
              icon={TrendingUp}
              trend={{ percentage: 15.2, period: "vs last month" }}
              tooltip="Percentage of analyzed deals that result in closed transactions."
            />
          </div>
        </ErrorBoundary>

        {/* Additional KPI Cards */}
        <ErrorBoundary>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <StatsCard
              title="Contracts"
              value={stats.totalContracts}
              change={`${stats.signedContracts} signed`}
              changeType="positive"
              icon={FileText}
            />
            <StatsCard
              title="Token Usage"
              value={`${stats.usedTokens}/${stats.totalTokens}`}
              change={`${stats.remainingTokens} remaining`}
              changeType={stats.remainingTokens > 10 ? "positive" : "negative"}
              icon={Zap}
            />
            <StatsCard
              title="Activation Rate"
              value={`${trends.activationRate.toFixed(1)}%`}
              change={`${stats.activeBuyers} active buyers`}
              changeType={trends.activationRate > 50 ? "positive" : "neutral"}
              icon={Activity}
            />
            <StatsCard
              title="This Week"
              value={marketInsights.recentTrends.newBuyersThisWeek}
              change={`${marketInsights.recentTrends.dealsThisWeek} deals added`}
              changeType="positive"
              icon={Award}
            />
          </div>
        </ErrorBoundary>

        {/* Onboarding Prompts for New Users */}
        <ErrorBoundary>
          <OnboardingPrompts stats={stats} />
        </ErrorBoundary>

        {/* Tabbed Content Area */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Quick Actions and Portfolio Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <ErrorBoundary>
                <QuickActions />
              </ErrorBoundary>
              <div className="lg:col-span-2">
                <ErrorBoundary>
                  <DealBuyerSnapshot stats={stats} trends={trends} />
                </ErrorBoundary>
              </div>
            </div>

            {/* Pipeline Overview */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
              <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Pipeline Overview</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">New Leads</span>
                      <Target className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.newBuyers}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Need qualification</p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Active Pipeline</span>
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.activeBuyers}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Ready for deals</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">Under Contract</span>
                      <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.underContractDeals}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">In progress</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Pipeline Health</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {trends.activationRate.toFixed(1)}% active
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(trends.activationRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <ErrorBoundary>
                <RecentActivity activities={recentActivity} />
              </ErrorBoundary>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <ErrorBoundary>
              <AdvancedCharts 
                buyerChartData={buyerChartData}
                marketInsights={marketInsights}
                stats={stats}
                trends={trends}
              />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>

        {/* Guided Tour */}
        <GuidedTour 
          isOpen={showOnboarding || showWelcomeTour} 
          onComplete={() => {
            setShowOnboarding(false);
            setShowWelcomeTour(false);
          }} 
        />
        
        <TokenPricingModal 
          open={tokenModalOpen} 
          onOpenChange={setTokenModalOpen} 
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
