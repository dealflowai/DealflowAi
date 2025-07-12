import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

interface AdvancedChartsProps {
  buyerChartData: any[];
  marketInsights: any;
  stats: any;
  trends: any;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AdvancedCharts = ({ buyerChartData, marketInsights, stats, trends }: AdvancedChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {/* Activity Chart */}
      <Card className="xl:col-span-2 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daily Activity</h3>
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buyerChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="buyers" fill="#3B82F6" name="New Buyers" />
              <Bar dataKey="deals" fill="#10B981" name="New Deals" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Budget Distribution */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Budget Distribution</h3>
          <DollarSign className="w-5 h-5 text-primary" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={marketInsights.budgetDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {marketInsights.budgetDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Markets */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Markets</h3>
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-3">
          {marketInsights.topMarkets.map((market: any, index: number) => (
            <div key={market.market} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{market.market}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(market.count / Math.max(...marketInsights.topMarkets.map((m: any) => m.count))) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{market.count}</span>
              </div>
            </div>
          ))}
          {marketInsights.topMarkets.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No market data available yet
            </p>
          )}
        </div>
      </Card>

      {/* Buyer Status Distribution */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Buyer Status</h3>
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-3">
          {marketInsights.statusDistribution.map((status: any, index: number) => (
            <div key={status.status} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {status.status}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{status.count}</span>
            </div>
          ))}
          {marketInsights.statusDistribution.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No status data available yet
            </p>
          )}
        </div>
      </Card>

      {/* Key Metrics Summary */}
      <Card className="xl:col-span-2 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{trends.activationRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Activation Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{trends.conversionRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">${(stats.totalBuyingPower / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Buying Power</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{marketInsights.recentTrends.newBuyersThisWeek}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">New This Week</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdvancedCharts;