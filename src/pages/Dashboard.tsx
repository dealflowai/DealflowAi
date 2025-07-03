
import React from 'react';
import Layout from '@/components/Layout/Layout';
import StatsCard from '@/components/Dashboard/StatsCard';
import RecentActivity from '@/components/Dashboard/RecentActivity';
import { Users, Calculator, FileText, DollarSign, TrendingUp, Target } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useUser } from '@clerk/clerk-react';

const Dashboard = () => {
  const { user } = useUser();
  const { stats, recentActivity, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.firstName || 'User'}. Here's your dealflow overview.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
              Export Report
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-200">
              New Deal
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Buyers"
            value={stats.totalBuyers}
            change={`${stats.newBuyers} new this month`}
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="Active Buyers"
            value={stats.activeBuyers}
            change={`${Math.round((stats.activeBuyers / Math.max(stats.totalBuyers, 1)) * 100)}% active rate`}
            changeType="positive"
            icon={Calculator}
          />
          <StatsCard
            title="Average Budget"
            value={`$${stats.averageBudget.toLocaleString()}`}
            change="Based on buyer data"
            changeType="neutral"
            icon={DollarSign}
            gradient={true}
          />
          <StatsCard
            title="New Buyers"
            value={stats.newBuyers}
            change="Need qualification"
            changeType="neutral"
            icon={FileText}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Overview */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Buyer Pipeline</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-800">New Buyers</span>
                  <Target className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-900">{stats.newBuyers}</p>
                <p className="text-xs text-yellow-600 mt-1">Need qualification</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Active Buyers</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-900">{stats.activeBuyers}</p>
                <p className="text-xs text-blue-600 mt-1">Ready for deals</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">Total Budget</span>
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900">
                  ${(stats.averageBudget * stats.totalBuyers).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">Combined buying power</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Rate</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-600">
                    {Math.round((stats.activeBuyers / Math.max(stats.totalBuyers, 1)) * 100)}%
                  </span>
                </div>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-teal-600 h-2 rounded-full" 
                  style={{ width: `${Math.round((stats.activeBuyers / Math.max(stats.totalBuyers, 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recent Activity with real data */}
          <RecentActivity activities={recentActivity} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
              <Calculator className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Analyze New Deal</span>
            </button>
            
            <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
              <Users className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Add Buyer</span>
            </button>
            
            <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
              <FileText className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Generate Contract</span>
            </button>
            
            <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group">
              <TrendingUp className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
