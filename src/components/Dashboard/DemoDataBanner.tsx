import React from 'react';
import { Button } from '@/components/ui/button';
import { Info, X, Users, Calculator } from 'lucide-react';

interface DemoDataBannerProps {
  onDismiss: () => void;
  onImportDemo: () => void;
}

const DemoDataBanner = ({ onDismiss, onImportDemo }: DemoDataBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 text-sm">
              Try Demo Mode
            </h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
              See how your dashboard looks with real data. Try our demo buyer:
            </p>
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-100 dark:border-indigo-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    Michael Rodriguez (Austin, TX)
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    $500K budget • 94% AI match confidence • Single-family focus
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-3">
              <Button 
                onClick={onImportDemo}
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Import Demo Data
              </Button>
              <Button 
                onClick={onDismiss}
                variant="ghost" 
                size="sm"
                className="text-indigo-600 hover:text-indigo-700"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
        <Button
          onClick={onDismiss}
          variant="ghost"
          size="sm"
          className="text-indigo-400 hover:text-indigo-600 p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DemoDataBanner;