

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  BarChart3,
  Users,
  FileText,
  Calculator,
  MessageSquare,
  Settings,
  Home,
  Search,
  TrendingUp
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Buyer CRM', path: '/buyers' },
  { icon: Search, label: 'Deal Analyzer', path: '/analyzer' },
  { icon: FileText, label: 'Contracts', path: '/contracts' },
  { icon: MessageSquare, label: 'Marketplace', path: '/marketplace' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0 z-40">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              dealflow.ai
            </h1>
            <p className="text-xs text-emerald-600 font-medium opacity-75">
              AI-Powered CRM
            </p>
          </div>
        </div>
      </div>

      <nav className="px-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent",
                isActive 
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm" 
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-100">
          <h3 className="font-medium text-sm text-gray-900 mb-1">Upgrade to Pro</h3>
          <p className="text-xs text-gray-600 mb-3">Unlock unlimited AI analysis and premium features</p>
          <button className="w-full bg-gradient-to-r from-emerald-600 to-green-700 text-white text-xs py-2 px-3 rounded-md hover:from-emerald-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

