/**
 * Security Service
 * Handles audit logging, rate limiting, and security monitoring
 */

import { supabase } from '@/integrations/supabase/client';

interface AuditLogData {
  userId?: string;
  adminId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}

export class SecurityService {
  /**
   * Log security-relevant events for audit purposes
   */
  static async logAuditEvent(data: AuditLogData): Promise<string | null> {
    try {
      // Get client IP (best effort in browser environment)
      const ipAddress = data.ipAddress || await this.getClientIP();
      const userAgent = data.userAgent || navigator.userAgent;

      const { data: result, error } = await supabase.rpc('log_audit_event', {
        p_user_id: data.userId || null,
        p_admin_id: data.adminId || null,
        p_action: data.action,
        p_resource_type: data.resourceType || null,
        p_resource_id: data.resourceId || null,
        p_details: data.details ? JSON.stringify(data.details) : null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      });

      if (error) {
        console.error('Failed to log audit event:', error);
        return null;
      }

      return result;
    } catch (error) {
      console.error('Error logging audit event:', error);
      return null;
    }
  }

  /**
   * Check rate limit for a specific action
   */
  static async checkRateLimit(
    identifier: string,
    endpoint: string,
    maxRequests = 100,
    windowMinutes = 60
  ): Promise<RateLimitResult> {
    try {
      const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_endpoint: endpoint,
        p_max_requests: maxRequests,
        p_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        // Fail open - allow request if rate limit check fails
        return {
          allowed: true,
          remaining: maxRequests,
          resetTime: new Date(Date.now() + windowMinutes * 60 * 1000)
        };
      }

      // Calculate reset time
      const now = new Date();
      const windowStart = new Date(now);
      windowStart.setMinutes(Math.floor(now.getMinutes() / windowMinutes) * windowMinutes, 0, 0);
      const resetTime = new Date(windowStart.getTime() + windowMinutes * 60 * 1000);

      return {
        allowed: allowed as boolean,
        remaining: allowed ? maxRequests - 1 : 0,
        resetTime
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Fail open
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: new Date(Date.now() + windowMinutes * 60 * 1000)
      };
    }
  }

  /**
   * Get audit logs for admin review
   */
  static async getAuditLogs(
    limit = 100,
    offset = 0,
    filters?: {
      userId?: string;
      action?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          id,
          user_id,
          admin_id,
          action,
          resource_type,
          resource_id,
          details,
          ip_address,
          user_agent,
          created_at
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch audit logs:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { data: [], error };
    }
  }

  /**
   * Security event types for consistent logging
   */
  static readonly EVENTS = {
    // Authentication events
    LOGIN_SUCCESS: 'auth.login.success',
    LOGIN_FAILURE: 'auth.login.failure',
    LOGOUT: 'auth.logout',
    SIGNUP: 'auth.signup',
    PASSWORD_CHANGE: 'auth.password.change',
    
    // Admin actions
    ADMIN_USER_VIEW: 'admin.user.view',
    ADMIN_USER_EDIT: 'admin.user.edit',
    ADMIN_USER_DELETE: 'admin.user.delete',
    ADMIN_DATA_EXPORT: 'admin.data.export',
    ADMIN_SETTINGS_CHANGE: 'admin.settings.change',
    
    // Data operations
    BUYER_CREATE: 'buyer.create',
    BUYER_UPDATE: 'buyer.update',
    BUYER_DELETE: 'buyer.delete',
    BUYER_EXPORT: 'buyer.export',
    
    DEAL_CREATE: 'deal.create',
    DEAL_UPDATE: 'deal.update',
    DEAL_DELETE: 'deal.delete',
    DEAL_ANALYZE: 'deal.analyze',
    
    CONTRACT_CREATE: 'contract.create',
    CONTRACT_UPDATE: 'contract.update',
    CONTRACT_DELETE: 'contract.delete',
    CONTRACT_SEND: 'contract.send',
    
    // Security events
    RATE_LIMIT_EXCEEDED: 'security.rate_limit.exceeded',
    SUSPICIOUS_ACTIVITY: 'security.suspicious.activity',
    DATA_BREACH_ATTEMPT: 'security.breach.attempt',
    
    // Token usage
    TOKEN_PURCHASE: 'token.purchase',
    TOKEN_USAGE: 'token.usage',
    
    // System events
    SYSTEM_ERROR: 'system.error',
    SYSTEM_MAINTENANCE: 'system.maintenance'
  } as const;

  /**
   * Helper method to get client IP address (best effort)
   */
  private static async getClientIP(): Promise<string> {
    try {
      // In a browser environment, we can't directly get the client IP
      // This would typically be handled by the backend/edge functions
      // For now, return a placeholder
      return 'client';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Log user authentication events
   */
  static async logAuthEvent(
    event: 'login' | 'logout' | 'signup' | 'failure',
    userId?: string,
    details?: Record<string, any>
  ) {
    const eventMap = {
      login: this.EVENTS.LOGIN_SUCCESS,
      logout: this.EVENTS.LOGOUT,
      signup: this.EVENTS.SIGNUP,
      failure: this.EVENTS.LOGIN_FAILURE
    };

    return this.logAuditEvent({
      userId,
      action: eventMap[event],
      details
    });
  }

  /**
   * Log admin actions
   */
  static async logAdminAction(
    adminId: string,
    action: string,
    resourceType?: string,
    resourceId?: string,
    details?: Record<string, any>
  ) {
    return this.logAuditEvent({
      adminId,
      action: `admin.${action}`,
      resourceType,
      resourceId,
      details
    });
  }

  /**
   * Log data operations
   */
  static async logDataOperation(
    userId: string,
    operation: 'create' | 'update' | 'delete' | 'export',
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>
  ) {
    return this.logAuditEvent({
      userId,
      action: `${resourceType}.${operation}`,
      resourceType,
      resourceId,
      details
    });
  }

  /**
   * Log security events
   */
  static async logSecurityEvent(
    event: string,
    userId?: string,
    details?: Record<string, any>
  ) {
    return this.logAuditEvent({
      userId,
      action: `security.${event}`,
      details: {
        ...details,
        severity: 'high',
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Monitor for suspicious activity patterns
   */
  static async detectSuspiciousActivity(
    userId: string,
    action: string
  ): Promise<boolean> {
    try {
      // Check for rapid repeated actions
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const { data: recentLogs } = await this.getAuditLogs(100, 0, {
        userId,
        action,
        startDate: fiveMinutesAgo
      });

      // Flag if more than 10 identical actions in 5 minutes
      if (recentLogs.length > 10) {
        await this.logSecurityEvent('suspicious.rapid_actions', userId, {
          action,
          count: recentLogs.length,
          timeWindow: '5_minutes'
        });
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}