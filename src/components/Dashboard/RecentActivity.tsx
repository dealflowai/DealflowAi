
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
  const [showAll, setShowAll] = useState(false);
  const displayedActivities = showAll ? activities : activities.slice(0, 3);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      </div>

      <div className="space-y-3 sm:space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Start by adding buyers or analyzing deals
            </p>
          </div>
        ) : (
          <>
            {displayedActivities.map((activity) => {
              const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || User;
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${activity.bgColor} dark:${activity.bgColor}/20`}>
                    <IconComponent className={`w-4 h-4 ${activity.color} dark:${activity.color.replace('600', '400')}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
            
            {activities.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-sm text-primary hover:text-primary/80 py-2 text-center"
              >
                {showAll ? 'Show less' : `Show ${activities.length - 3} more`}
              </button>
            )}
          </>
        )}
      </div>
      
      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-primary py-2 text-center">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
