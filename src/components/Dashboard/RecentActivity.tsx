
import React, { useState } from 'react';
import { Clock, User, FileText, Calculator } from 'lucide-react';

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

const iconMap = {
  User,
  FileText,
  Calculator,
  Clock,
};

const RecentActivity = ({ activities = [] }: RecentActivityProps) => {
  // Default activities if none provided
  const defaultActivities = [
    {
      id: '1',
      type: 'buyer_qualified',
      title: 'New buyer qualified',
      description: 'Sarah Johnson - Land investor, $50K budget',
      time: '2 minutes ago',
      icon: 'User',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: '2',
      type: 'deal_analyzed',
      title: 'Deal analysis completed',
      description: '123 Oak St - Score: 8.5/10, $45K max offer',
      time: '15 minutes ago',
      icon: 'Calculator',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: '3',
      type: 'contract_generated',
      title: 'Contract generated',
      description: 'Purchase Agreement for 456 Pine Ave',
      time: '1 hour ago',
      icon: 'FileText',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: '4',
      type: 'buyer_matched',
      title: 'Buyer match found',
      description: '3 buyers matched for Riverside property',
      time: '2 hours ago',
      icon: 'User',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;
  const [showAll, setShowAll] = useState(false);
  const visibleActivities = showAll ? displayActivities : displayActivities.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      </div>

      <div className="space-y-3 sm:space-y-4">
        {visibleActivities.map((activity) => {
          const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || User;
          return (
            <div key={activity.id} className="flex items-start space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
              <div className={`p-1.5 sm:p-2 rounded-lg ${activity.bgColor} dark:${activity.bgColor.replace('50', '900/20')}`}>
                <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 ${activity.color} dark:${activity.color.replace('600', '400')}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      {displayActivities.length > 5 && (
        <div className="mt-3 sm:mt-4 text-center">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
          >
            {showAll ? 'Show less' : `See ${displayActivities.length - 5} more activities`}
          </button>
        </div>
      )}

      {activities.length === 0 && (
        <div className="text-center py-4">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No recent activity. Add some buyers to get started!</p>
        </div>
      )}

      <button className="w-full mt-3 sm:mt-4 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200">
        View all activity
      </button>
    </div>
  );
};

export default RecentActivity;
