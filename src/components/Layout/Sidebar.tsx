
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
  TrendingUp,
  ChevronLeft,
  ChevronRight
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

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();

  return (
    <div className={cn(
      "bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0 z-40 transition-all duration-200 dark:bg-gray-800 dark:border-gray-700",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn("p-6 flex items-center", collapsed && "justify-center p-3")}>
        {!collapsed && (
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
        )}
        
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => onToggle(!collapsed)}
          className={cn(
            "hidden lg:flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors",
            collapsed ? "ml-2" : "ml-auto"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent dark:hover:bg-gray-700",
                isActive 
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm" 
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground dark:text-gray-300",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Upgrade Card */}
      {!collapsed && (
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-4 border border-emerald-100 dark:border-emerald-800">
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">Upgrade to Pro</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Unlock unlimited AI analysis and premium features</p>
            <button className="w-full bg-gradient-to-r from-emerald-600 to-green-700 text-white text-xs py-2 px-3 rounded-md hover:from-emerald-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
