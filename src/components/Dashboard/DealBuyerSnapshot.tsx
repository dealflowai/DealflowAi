import React from 'react';
import { FileText, Users, TrendingUp, DollarSign, Target, Zap } from 'lucide-react';

interface DealBuyerSnapshotProps {
  stats: {
    totalDeals: number;
    activeDeals: number;
    closedDeals: number;
    totalBuyers: number;
    activeBuyers: number;
    averageBudget: number;
    averageDealValue: number;
  };
  trends: {
    conversionRate: number;
  };
}

const DealBuyerSnapshot = ({ stats, trends }: DealBuyerSnapshotProps) => {
  const dealMetrics = [
    {
      label: 'Analyzed this week',
      value: stats.activeDeals,
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      label: 'Deals matched to buyers',
      value: Math.floor(stats.activeDeals * 0.6),
      icon: Target,
      color: 'text-green-600'
    },
    {
      label: 'Contracts sent',
      value: Math.floor(stats.closedDeals * 1.5),
      icon: Zap,
      color: 'text-purple-600'
    }
  ];

  const buyerMetrics = [
    {
      label: 'Active Buyers',
      value: stats.activeBuyers,
      icon: Users,
      color: 'text-emerald-600'
    },
    {
      label: 'Avg Buyer ROI',
      value: `${trends.conversionRate.toFixed(0)}%`,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      label: 'Avg Budget',
      value: `$${(stats.averageBudget / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Portfolio Snapshot
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deals Overview */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-blue-500" />
            Deals Overview
          </h4>
          <div className="space-y-3">
            {dealMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`w-4 h-4 ${metric.color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {metric.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buyers Overview */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
            <Users className="w-4 h-4 mr-2 text-green-500" />
            Buyers Overview
          </h4>
          <div className="space-y-3">
            {buyerMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`w-4 h-4 ${metric.color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {metric.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealBuyerSnapshot;