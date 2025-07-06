import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building, ShoppingCart, FileText, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">DealFlow AI</h1>
        </div>
        
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            <NavItem
              to="/dashboard"
              icon={<LayoutDashboard className="w-5 h-5" />}
              text="Dashboard"
              isActive={location.pathname === '/dashboard'}
            />
            <NavItem
              to="/buyers"
              icon={<Users className="w-5 h-5" />}
              text="Buyer CRM"
              isActive={location.pathname === '/buyers'}
              testId="buyers-nav"
            />
            <NavItem
              to="/deals"
              icon={<Building className="w-5 h-5" />}
              text="Deal Analyzer"
              isActive={location.pathname === '/deals'}
              testId="deals-nav"
            />
            <NavItem
              to="/marketplace"
              icon={<ShoppingCart className="w-5 h-5" />}
              text="Marketplace"
              isActive={location.pathname === '/marketplace'}
            />
            <NavItem
              to="/contracts"
              icon={<FileText className="w-5 h-5" />}
              text="Contracts"
              isActive={location.pathname === '/contracts'}
              testId="contracts-nav"
            />
            <NavItem
              to="/analytics"
              icon={<BarChart3 className="w-5 h-5" />}
              text="Analytics"
              isActive={location.pathname === '/analytics'}
            />
            <NavItem
              to="/settings"
              icon={<Settings className="w-5 h-5" />}
              text="Settings"
              isActive={location.pathname === '/settings'}
            />
          </div>
        </nav>
      </div>
    </>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  testId?: string;
}

const NavItem = ({ to, icon, text, isActive, testId }: NavItemProps) => (
  <Link
    to={to}
    data-testid={testId}
    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    {icon}
    <span className="ml-3">{text}</span>
  </Link>
);

export default Sidebar;
