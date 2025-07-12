
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, FileText, Calculator, Filter, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface RecentActivityProps {
  activities?: Activity[];
}

const activityTypeColors = {
  buyer: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 text-blue-800' },
  deal: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', badge: 'bg-green-100 text-green-800' },
  contract: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 text-orange-800' },
  ai: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-100 text-purple-800' },
  success: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', badge: 'bg-green-100 text-green-800' },
  warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-100 text-yellow-800' },
};

const iconMap = {
  User,
  FileText,
  Calculator,
  Clock,
};

const RecentActivity = ({ activities = [] }: RecentActivityProps) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  
  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type.toLowerCase() === filter);
  
  const displayedActivities = showAll ? filteredActivities : filteredActivities.slice(0, 5);

  const filterOptions = [
    { value: 'all', label: 'All Activity' },
    { value: 'buyer', label: 'Buyers' },
    { value: 'deal', label: 'Deals' },
    { value: 'contract', label: 'Contracts' },
    { value: 'ai', label: 'AI' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-600 dark:text-gray-400"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filter === 'all' ? 'No recent activity' : `No ${filter} activity`}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Start by adding buyers or analyzing deals
            </p>
          </div>
        ) : (
          <>
            {displayedActivities.map((activity) => {
              const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || User;
              const colors = activityTypeColors[activity.type.toLowerCase() as keyof typeof activityTypeColors] || activityTypeColors.ai;
              
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <IconComponent className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                      <Badge variant="secondary" className={`text-xs ${colors.badge}`}>
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
            
            {filteredActivities.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-sm text-primary hover:text-primary/80 py-2 text-center"
              >
                {showAll ? 'Show less' : `Show ${filteredActivities.length - 5} more`}
              </button>
            )}
          </>
        )}
      </div>
      
      {filteredActivities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-primary py-2"
            onClick={() => navigate('/analytics?tab=activity')}
          >
            View all activity
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
