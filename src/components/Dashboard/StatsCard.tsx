
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient?: boolean;
  'data-tour'?: string;
}

const StatsCard = ({ title, value, change, changeType = 'neutral', icon: Icon, gradient = false, 'data-tour': dataTour }: StatsCardProps) => {
  return (
    <div 
      className={`rounded-xl p-3 md:p-4 border transition-all duration-200 hover:shadow-lg ${
        gradient 
          ? 'bg-primary text-white border-transparent' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      data-tour={dataTour}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${gradient ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}>
            {title}
          </p>
          <p className={`text-2xl md:text-3xl font-bold mt-2 ${gradient ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${
              gradient 
                ? 'text-blue-100' 
                : changeType === 'positive' 
                  ? 'text-green-600 dark:text-green-400' 
                  : changeType === 'negative' 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-500 dark:text-gray-400'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          gradient 
            ? 'bg-white/20' 
            : 'bg-gray-50 dark:bg-gray-700'
        }`}>
          <Icon className={`w-6 h-6 ${gradient ? 'text-white' : 'text-primary'}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
