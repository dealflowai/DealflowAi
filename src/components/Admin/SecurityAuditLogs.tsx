/**
 * Security Audit Logs Component
 * Displays security events and audit trail for admin review
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SecurityService } from '@/services/securityService';
import { useSecurity } from '@/hooks/useSecurity';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  User, 
  Calendar, 
  Filter, 
  Download,
  Search,
  RefreshCw,
  Eye,
  Globe
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string | null;
  admin_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const SecurityAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [page, setPage] = useState(0);
  const { toast } = useToast();
  const { logDataOperation } = useSecurity();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      
      if (searchTerm) {
        // This is a simplified search - in a real app you'd want full-text search
        filters.action = searchTerm;
      }
      
      if (actionFilter !== 'all') {
        filters.action = actionFilter;
      }
      
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        filters.startDate = startDate;
      }

      const { data, error } = await SecurityService.getAuditLogs(100, page * 100, filters);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch audit logs",
          variant: "destructive"
        });
        return;
      }
      
      setLogs(data as AuditLog[]);
      
      // Log this admin action
      await logDataOperation('export', 'audit_logs', undefined, {
        filters,
        resultsCount: data.length
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchTerm, actionFilter, dateFilter, page]);

  const getActionBadgeColor = (action: string) => {
    if (action.includes('security')) return 'destructive';
    if (action.includes('admin')) return 'secondary';
    if (action.includes('auth')) return 'outline';
    if (action.includes('delete')) return 'destructive';
    return 'default';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('security')) return AlertTriangle;
    if (action.includes('admin')) return Shield;
    if (action.includes('auth')) return User;
    if (action.includes('view')) return Eye;
    return Globe;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportLogs = async () => {
    try {
      const { data } = await SecurityService.getAuditLogs(1000, 0, {
        startDate: dateFilter !== 'all' ? new Date() : undefined
      });
      
      const csvContent = [
        'Timestamp,User ID,Action,Resource Type,Resource ID,IP Address,Details',
        ...data.map(log => [
          log.created_at,
          log.user_id || 'N/A',
          log.action,
          log.resource_type || 'N/A',
          log.resource_id || 'N/A',
          log.ip_address || 'N/A',
          JSON.stringify(log.details || {})
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      await logDataOperation('export', 'audit_logs', undefined, {
        exportedCount: data.length,
        filters: { dateFilter, actionFilter, searchTerm }
      });
      
      toast({
        title: "Export Complete",
        description: `Exported ${data.length} audit log entries`
      });
      
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export audit logs",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Security Audit Logs</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="auth">Authentication</SelectItem>
              <SelectItem value="admin">Admin Actions</SelectItem>
              <SelectItem value="security">Security Events</SelectItem>
              <SelectItem value="buyer">Buyer Operations</SelectItem>
              <SelectItem value="deal">Deal Operations</SelectItem>
              <SelectItem value="contract">Contract Operations</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        
        {/* Logs Table */}
        <div className="rounded-md border">
          <div className="max-h-[600px] overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Loading audit logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No audit logs found for the selected filters
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {logs.map((log) => {
                  const ActionIcon = getActionIcon(log.action);
                  
                  return (
                    <div
                      key={log.id}
                      className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <ActionIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getActionBadgeColor(log.action)}>
                            {log.action}
                          </Badge>
                          {log.resource_type && (
                            <span className="text-sm text-muted-foreground">
                              on {log.resource_type}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatTimestamp(log.created_at)}
                          </span>
                          
                          {log.user_id && (
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {log.user_id.slice(0, 8)}...
                            </span>
                          )}
                          
                          {log.ip_address && (
                            <span className="flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              {log.ip_address}
                            </span>
                          )}
                        </div>
                        
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Show details
                            </summary>
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {logs.length >= 100 && (
          <div className="flex justify-center">
            <Button
              onClick={() => setPage(page + 1)}
              variant="outline"
            >
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityAuditLogs;