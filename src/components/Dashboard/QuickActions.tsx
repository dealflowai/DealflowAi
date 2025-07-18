import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Calculator, FileText, Bot, Plus, Search, Brain, Zap } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();
  const actions = [
    {
      id: 'add-buyer',
      title: 'Add Buyer',
      description: 'Import or add buyer',
      icon: Users,
      actionUrl: '/buyers?action=add',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'discover-buyers',
      title: 'Discover',
      description: 'AI buyer discovery',
      icon: Bot,
      actionUrl: '/buyers?tab=discovery',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'analyze-deal',
      title: 'Analyze',
      description: 'AI property analysis',
      icon: Calculator,
      actionUrl: '/analyzer',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'create-contract',
      title: 'Contracts',
      description: 'Generate contracts',
      icon: FileText,
      actionUrl: '/contracts',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
        <Zap className="w-5 h-5 text-primary" />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={action.id}
              onClick={() => navigate(action.actionUrl)}
              className={`${action.color} text-white h-auto p-2 flex flex-col items-center justify-center space-y-1 hover:scale-105 transition-all duration-200 min-h-[70px]`}
              variant="ghost"
            >
              <IconComponent className="w-4 h-4 shrink-0" />
              <div className="text-center space-y-0.5">
                <div className="font-medium text-xs leading-none">{action.title}</div>
                <div className="text-[10px] opacity-90 leading-none">{action.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;