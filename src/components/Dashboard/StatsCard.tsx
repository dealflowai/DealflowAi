
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient?: boolean;
}

const StatsCard = ({ title, value, change, changeType = 'neutral', icon: Icon, gradient = false }: StatsCardProps) => {
  return (
    <div className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
      gradient 
        ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white border-transparent' 
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${gradient ? 'text-blue-100' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 ${gradient ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${
              gradient 
                ? 'text-blue-100' 
                : changeType === 'positive' 
                  ? 'text-green-600' 
                  : changeType === 'negative' 
                    ? 'text-red-600' 
                    : 'text-gray-500'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          gradient 
            ? 'bg-white/20' 
            : 'bg-gray-50'
        }`}>
          <Icon className={`w-6 h-6 ${gradient ? 'text-white' : 'text-blue-600'}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
