import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Calculator, FileText, Bot, Plus, Search, Brain, Zap } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      id: 'add-buyer',
      title: 'Add Buyer',
      description: 'Import or manually add a new buyer',
      icon: Users,
      actionUrl: '/buyers?action=add',
      color: 'bg-blue-500 hover:bg-blue-600',
      shortcut: 'B'
    },
    {
      id: 'discover-buyers',
      title: 'Discover Buyers',
      description: 'AI-powered buyer discovery',
      icon: Bot,
      actionUrl: '/buyers?tab=discovery',
      color: 'bg-purple-500 hover:bg-purple-600',
      shortcut: 'D'
    },
    {
      id: 'analyze-deal',
      title: 'Analyze Deal',
      description: 'Run AI analysis on a property',
      icon: Calculator,
      actionUrl: '/analyzer',
      color: 'bg-green-500 hover:bg-green-600',
      shortcut: 'A'
    },
    {
      id: 'create-contract',
      title: 'Create Contract',
      description: 'Generate professional contracts',
      icon: FileText,
      actionUrl: '/contracts',
      color: 'bg-orange-500 hover:bg-orange-600',
      shortcut: 'C'
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
              onClick={() => window.location.href = action.actionUrl}
              className={`${action.color} text-white h-auto p-3 flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-all duration-200 min-h-[80px]`}
              variant="ghost"
            >
              <IconComponent className="w-4 h-4" />
              <div className="text-center">
                <div className="font-medium text-xs leading-tight">{action.title}</div>
                <div className="text-xs opacity-90 leading-tight mt-1">{action.description}</div>
              </div>
              <div className="text-xs bg-white/20 rounded px-1.5 py-0.5">
                ⌘{action.shortcut}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;