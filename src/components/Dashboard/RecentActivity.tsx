
import React from 'react';
import { Clock, User, FileText, Calculator } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'buyer_qualified',
    title: 'New buyer qualified',
    description: 'Sarah Johnson - Land investor, $50K budget',
    time: '2 minutes ago',
    icon: User,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 2,
    type: 'deal_analyzed',
    title: 'Deal analysis completed',
    description: '123 Oak St - Score: 8.5/10, $45K max offer',
    time: '15 minutes ago',
    icon: Calculator,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 3,
    type: 'contract_generated',
    title: 'Contract generated',
    description: 'Purchase Agreement for 456 Pine Ave',
    time: '1 hour ago',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 4,
    type: 'buyer_matched',
    title: 'Buyer match found',
    description: '3 buyers matched for Riverside property',
    time: '2 hours ago',
    icon: User,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

const RecentActivity = () => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                <Icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
        View all activity
      </button>
    </div>
  );
};

export default RecentActivity;
