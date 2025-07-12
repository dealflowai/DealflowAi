/**
 * Security Hook
 * Provides security utilities and monitoring for React components
 */

import { useCallback, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { SecurityService } from '@/services/securityService';
import { supabase } from '@/integrations/supabase/client';

interface SecurityHookOptions {
  enableRateLimit?: boolean;
  enableAuditLog?: boolean;
  enableSuspiciousActivityDetection?: boolean;
  rateLimitMaxRequests?: number;
  rateLimitWindowMinutes?: number;
}

interface SecurityAction {
  endpoint: string;
  action?: string;
  data?: any;
}

export function useSecurity(options: SecurityHookOptions = {}) {
  const { user } = useUser();
  const actionsRef = useRef<Map<string, number>>(new Map());
  
  const {
    enableRateLimit = true,
    enableAuditLog = true,
    enableSuspiciousActivityDetection = true,
    rateLimitMaxRequests = 100,
    rateLimitWindowMinutes = 60
  } = options;

  // Track component mount for security monitoring
  useEffect(() => {
    if (enableAuditLog && user) {
      SecurityService.logAuditEvent({
        userId: user.id,
        action: 'component.mount',
        details: { component: 'security_hook' }
      });
    }
  }, [user, enableAuditLog]);

  /**
   * Execute a security-checked action
   */
  const secureAction = useCallback(async <T>(
    { endpoint, action, data }: SecurityAction,
    callback: () => Promise<T>
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      // Rate limiting check
      if (enableRateLimit) {
        const { data: securityCheck, error } = await supabase.functions.invoke('security-check', {
          body: {
            endpoint,
            action,
            maxRequests: rateLimitMaxRequests,
            windowMinutes: rateLimitWindowMinutes
          }
        });

        if (error) {
          console.warn('Security check failed:', error);
          // Continue with action (fail open)
        } else if (securityCheck && !securityCheck.allowed) {
          const errorMsg = `Rate limit exceeded for ${endpoint}. Try again in ${securityCheck.retryAfter || 60} seconds.`;
          
          if (enableAuditLog && user) {
            await SecurityService.logSecurityEvent('rate_limit_blocked', user.id, {
              endpoint,
              action,
              retryAfter: securityCheck.retryAfter
            });
          }
          
          return { success: false, error: errorMsg };
        }
      }

      // Execute the callback
      const result = await callback();

      // Log successful action
      if (enableAuditLog && user && action) {
        await SecurityService.logAuditEvent({
          userId: user.id,
          action,
          details: { 
            endpoint,
            success: true,
            dataSize: data ? JSON.stringify(data).length : 0
          }
        });
      }

      // Track action frequency for suspicious activity detection
      if (enableSuspiciousActivityDetection && action) {
        const key = `${action}_${Date.now()}`;
        const currentCount = actionsRef.current.get(action) || 0;
        actionsRef.current.set(action, currentCount + 1);

        // Check if too many actions in short time
        if (currentCount > 10) {
          await SecurityService.logSecurityEvent('rapid_actions_detected', user?.id, {
            action,
            count: currentCount,
            timeWindow: '1_minute'
          });
        }
      }

      return { success: true, data: result };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Action failed';
      
      // Log failed action
      if (enableAuditLog && user) {
        await SecurityService.logAuditEvent({
          userId: user.id,
          action: action || 'unknown_action',
          details: { 
            endpoint,
            success: false,
            error: errorMsg,
            stack: error instanceof Error ? error.stack : undefined
          }
        });
      }

      return { success: false, error: errorMsg };
    }
  }, [
    user,
    enableRateLimit,
    enableAuditLog,
    enableSuspiciousActivityDetection,
    rateLimitMaxRequests,
    rateLimitWindowMinutes
  ]);

  /**
   * Log authentication events
   */
  const logAuthEvent = useCallback(async (
    event: 'login' | 'logout' | 'signup' | 'failure',
    details?: Record<string, any>
  ) => {
    if (!enableAuditLog) return;
    
    await SecurityService.logAuthEvent(event, user?.id, details);
  }, [user, enableAuditLog]);

  /**
   * Log data operations
   */
  const logDataOperation = useCallback(async (
    operation: 'create' | 'update' | 'delete' | 'export',
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>
  ) => {
    if (!enableAuditLog || !user) return;
    
    await SecurityService.logDataOperation(
      user.id,
      operation,
      resourceType,
      resourceId,
      details
    );
  }, [user, enableAuditLog]);

  /**
   * Report suspicious activity
   */
  const reportSuspiciousActivity = useCallback(async (
    description: string,
    details?: Record<string, any>
  ) => {
    await SecurityService.logSecurityEvent('user_reported_suspicious', user?.id, {
      description,
      ...details,
      reportedAt: new Date().toISOString()
    });
  }, [user]);

  /**
   * Check if action is rate limited
   */
  const checkRateLimit = useCallback(async (
    endpoint: string,
    maxRequests?: number,
    windowMinutes?: number
  ) => {
    if (!enableRateLimit) return { allowed: true, remaining: 999, resetTime: new Date() };

    const identifier = user?.id || 'anonymous';
    return await SecurityService.checkRateLimit(
      identifier,
      endpoint,
      maxRequests || rateLimitMaxRequests,
      windowMinutes || rateLimitWindowMinutes
    );
  }, [user, enableRateLimit, rateLimitMaxRequests, rateLimitWindowMinutes]);

  /**
   * Clean up action tracking periodically
   */
  useEffect(() => {
    const cleanup = setInterval(() => {
      actionsRef.current.clear();
    }, 60000); // Clear every minute

    return () => clearInterval(cleanup);
  }, []);

  return {
    secureAction,
    logAuthEvent,
    logDataOperation,
    reportSuspiciousActivity,
    checkRateLimit,
    user,
    isAuthenticated: !!user
  };
}