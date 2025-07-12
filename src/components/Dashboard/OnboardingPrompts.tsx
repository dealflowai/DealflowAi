import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Calculator, FileText, Bot, Plus, Target, Zap, Brain } from 'lucide-react';

interface OnboardingPromptsProps {
  stats: {
    totalBuyers: number;
    totalDeals: number;
    totalContracts: number;
  };
}

const OnboardingPrompts = ({ stats }: OnboardingPromptsProps) => {
  const [hiddenPrompts, setHiddenPrompts] = useState<string[]>(() => {
    const stored = localStorage.getItem('hiddenOnboardingPrompts');
    return stored ? JSON.parse(stored) : [];
  });

  const hidePrompt = (promptId: string) => {
    const newHidden = [...hiddenPrompts, promptId];
    setHiddenPrompts(newHidden);
    localStorage.setItem('hiddenOnboardingPrompts', JSON.stringify(newHidden));
  };

  const prompts = [
    {
      id: 'buyers',
      show: stats.totalBuyers === 0 && !hiddenPrompts.includes('buyers'),
      emoji: '🎯',
      title: 'Add your first buyer to unlock insights',
      description: 'Import leads or discover qualified cash buyers in your market',
      action: 'Discover Buyers',
      actionUrl: '/buyers',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'deals',
      show: stats.totalDeals === 0 && !hiddenPrompts.includes('deals'),
      emoji: '📈',
      title: 'Run a Deal Analysis to calculate metrics',
      description: 'Analyze your first property to get market insights and ROI calculations',
      action: 'Analyze Deal',
      actionUrl: '/analyzer',
      icon: Calculator,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'ai-discovery',
      show: stats.totalBuyers < 5 && !hiddenPrompts.includes('ai-discovery'),
      emoji: '🤖',
      title: 'Discover buyers with AI – start your first search',
      description: 'Use AI to find qualified buyers that match your deal criteria',
      action: 'AI Discovery',
      actionUrl: '/buyers?tab=discovery',
      icon: Bot,
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      id: 'contracts',
      show: stats.totalContracts === 0 && stats.totalDeals > 0 && !hiddenPrompts.includes('contracts'),
      emoji: '📝',
      title: 'Generate your first contract',
      description: 'Create professional contracts for your analyzed deals',
      action: 'Create Contract',
      actionUrl: '/contracts',
      icon: FileText,
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const visiblePrompts = prompts.filter(prompt => prompt.show);

  if (visiblePrompts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Next Steps</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visiblePrompts.map((prompt) => {
          const IconComponent = prompt.icon;
          return (
            <div 
              key={prompt.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${prompt.gradient} text-white`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{prompt.emoji}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {prompt.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {prompt.description}
                  </p>
                  <Button 
                    onClick={() => {
                      // Hide only this specific prompt
                      hidePrompt(prompt.id);
                      // Navigate to the action
                      window.location.href = prompt.actionUrl;
                    }}
                    className={`bg-gradient-to-r ${prompt.gradient} hover:opacity-90 text-white text-sm w-full`}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {prompt.action}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingPrompts;