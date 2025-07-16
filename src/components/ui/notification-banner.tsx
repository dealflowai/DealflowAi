import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface NotificationBannerProps {
  type: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const typeConfig = {
  error: {
    icon: AlertTriangle,
    className: 'bg-destructive text-destructive-foreground',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-500 text-yellow-50',
  },
  success: {
    icon: CheckCircle,
    className: 'bg-green-500 text-green-50',
  },
  info: {
    icon: Info,
    className: 'bg-blue-500 text-blue-50',
  },
};

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  type,
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  className,
}) => {
  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div className={cn(config.className, 'p-3', className)}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <IconComponent className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            {title && (
              <p className="font-medium text-sm">{title}</p>
            )}
            <p className={cn("text-sm", title ? "mt-1" : "")}>{message}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="text-current hover:bg-white/20"
            >
              {action.label}
            </Button>
          )}
          
          {dismissible && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-current hover:bg-white/20 p-1"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};