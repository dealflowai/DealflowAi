
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import StatsCard from '@/components/Dashboard/StatsCard';
import RecentActivity from '@/components/Dashboard/RecentActivity';
import AdvancedCharts from '@/components/Dashboard/AdvancedCharts';
import GuidedTour from '@/components/Onboarding/GuidedTour';
import { Users, Calculator, FileText, DollarSign, TrendingUp, Target, Lightbulb, Plus, Bot, Gem, BarChart3, Activity, Award, Zap } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { useTokens } from '@/contexts/TokenContext';
import { TokenPricingModal } from '@/components/ui/token-pricing-modal';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
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
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
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
            <Button variant="outline" data-tour="contracts" className="text-xs sm:text-sm">
              Export Report
            </Button>
            <Button 
              onClick={() => window.location.href = '/analyzer'}
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
                    onClick={() => window.location.href = insight.actionUrl}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard
            title="Total Buyers"
            value={stats.totalBuyers}
            change={trends.buyersGrowth > 0 ? `+${trends.buyersGrowth.toFixed(1)}% growth` : `${stats.newBuyers} new this month`}
            changeType={trends.buyersGrowth > 0 ? "positive" : "neutral"}
            icon={Users}
            data-tour="buyers-cta"
          />
          <StatsCard
            title="Active Deals"
            value={stats.activeDeals}
            change={`${stats.totalDeals} total deals`}
            changeType="positive"
            icon={Calculator}
          />
          <StatsCard
            title="Buying Power"
            value={`$${(stats.totalBuyingPower / 1000000).toFixed(1)}M`}
            change={`Avg: $${stats.averageBudget.toLocaleString()}`}
            changeType="positive"
            icon={DollarSign}
            gradient={true}
          />
          <StatsCard
            title="Conversion Rate"
            value={`${trends.conversionRate.toFixed(1)}%`}
            change={`${stats.closedDeals} closed deals`}
            changeType={trends.conversionRate > 0 ? "positive" : "neutral"}
            icon={TrendingUp}
          />
        </div>

        {/* Additional KPI Cards */}
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

        {/* Zero State Check */}
        {stats.totalBuyers === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 text-center">
              <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Buyers Yet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Import a lead or discover buyers to start building your pipeline.</p>
              <Button 
                onClick={() => window.location.href = '/buyers'}
                className="bg-primary hover:bg-primary/90 text-xs sm:text-sm w-full sm:w-auto" 
                data-tour="buyers-cta"
              >
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Discover Buyers
              </Button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 text-center">
              <Calculator className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Deals Analyzed</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Import a lead or scrape a listing to start analyzing deals.</p>
              <Button 
                onClick={() => window.location.href = '/analyzer'}
                variant="outline" 
                data-tour="ai-discovery" 
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Analyze First Deal
              </Button>
            </div>
          </div>
        )}

        {/* Tabbed Content Area */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
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
              <RecentActivity activities={recentActivity} />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedCharts 
              buyerChartData={buyerChartData}
              marketInsights={marketInsights}
              stats={stats}
              trends={trends}
            />
          </TabsContent>

          <TabsContent value="activity">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity activities={recentActivity} />
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={() => window.location.href = '/analyzer'}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Analyze New Deal
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/buyers'}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add New Buyer
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/contracts'}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Contract
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <button 
              onClick={() => window.location.href = '/analyzer'}
              className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
            >
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">Analyze New Deal</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/buyers'}
              className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 group" 
              data-tour="buyers-cta"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-300">Add Buyer</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/contracts'}
              className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">Generate Contract</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/analytics'}
              className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 group"
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-700 dark:group-hover:text-orange-300">View Analytics</span>
            </button>
          </div>
        </div>

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
