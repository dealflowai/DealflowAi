import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Loader2, User, Calendar, CheckCircle, XCircle, RefreshCw, Settings, Search, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EmailLead {
  id: string;
  messageId: string;
  subject: string;
  sender: {
    name?: string;
    email: string;
  };
  content: string;
  date: string;
  buyerSignals: string[];
  extractedInfo: {
    budget?: { min?: number; max?: number };
    location?: string;
    propertyTypes?: string[];
    timeline?: string;
    contactInfo?: {
      phone?: string;
      email: string;
    };
  };
  confidenceScore: number;
  buyerType?: string;
}

const GmailIntegration = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchKeywords, setSearchKeywords] = useState('real estate, investment, property, cash buyer, investor');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [leads, setLeads] = useState<EmailLead[]>([]);

  const getAuthHeaders = async () => {
    const session = await supabase.auth.getSession();
    return {
      Authorization: `Bearer ${session.data.session?.access_token}`,
    };
  };

  // Check Gmail auth status
  const { data: authStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['gmail-auth-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const headers = await getAuthHeaders();
      const { data, error } = await supabase.functions.invoke('gmail-integration', {
        body: { action: 'status' },
        headers,
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const connectGmail = async () => {
    setIsConnecting(true);
    try {
      const headers = await getAuthHeaders();
      const { data, error } = await supabase.functions.invoke('gmail-integration', {
        body: { action: 'auth' },
        headers
      });
      
      if (error) throw error;
      
      if (data.authUrl) {
        // Open Google OAuth flow
        window.open(data.authUrl, '_blank', 'width=500,height=600');
        
        // Poll for authentication completion
        const checkAuth = async () => {
          try {
            const headers = await getAuthHeaders();
            const { data: statusData } = await supabase.functions.invoke('gmail-integration', {
              body: { action: 'status' },
              headers
            });
            
            if (statusData?.authenticated) {
              queryClient.invalidateQueries({ queryKey: ['gmail-auth-status'] });
              toast({
                title: "Gmail Connected!",
                description: "Successfully connected your Gmail account.",
              });
              return true;
            }
            return false;
          } catch {
            return false;
          }
        };
        
        // Poll every 3 seconds for up to 2 minutes
        const pollInterval = setInterval(async () => {
          const success = await checkAuth();
          if (success) {
            clearInterval(pollInterval);
          }
        }, 3000);
        
        // Clear interval after 2 minutes
        setTimeout(() => clearInterval(pollInterval), 120000);
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect Gmail account.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectGmail = async () => {
    try {
      const headers = await getAuthHeaders();
      const { error } = await supabase.functions.invoke('gmail-integration', {
        body: { action: 'revoke' },
        headers
      });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['gmail-auth-status'] });
      setLeads([]);
      
      toast({
        title: "Gmail Disconnected",
        description: "Successfully disconnected your Gmail account.",
      });
    } catch (error: any) {
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect Gmail account.",
        variant: "destructive",
      });
    }
  };

  const searchEmails = async () => {
    if (!authStatus?.authenticated) {
      toast({
        title: "Gmail Not Connected",
        description: "Please connect your Gmail account first.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const headers = await getAuthHeaders();
      const { data, error } = await supabase.functions.invoke('gmail-integration', {
        body: { 
          action: 'search',
          keywords: searchKeywords.split(',').map(k => k.trim()),
          maxResults: 50,
          filters: {
            dateRange: 'month'
          }
        },
        headers
      });
      
      if (error) throw error;
      
      const searchData = data?.data || data;
      setLeads(searchData?.leads || []);
      
      toast({
        title: "Email Search Complete",
        description: `Found ${searchData?.leads?.length || 0} potential buyer leads.`,
      });
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search emails.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addLeadToCRM = async (lead: EmailLead) => {
    try {
      // Get the user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user?.id)
        .single();
      
      if (!profile?.id) throw new Error('User profile not found');

      // Format budget values
      const budgetMin = lead.extractedInfo.budget?.min || null;
      const budgetMax = lead.extractedInfo.budget?.max || null;

      const { error } = await supabase
        .from('buyers')
        .insert({
          owner_id: profile.id,
          name: lead.sender.name || lead.sender.email.split('@')[0],
          email: lead.extractedInfo.contactInfo?.email || lead.sender.email,
          phone: lead.extractedInfo.contactInfo?.phone,
          location_focus: lead.extractedInfo.location,
          budget_min: budgetMin,
          budget_max: budgetMax,
          property_type_interest: lead.extractedInfo.propertyTypes,
          status: 'new',
          priority: lead.confidenceScore > 80 ? 'HIGH' : lead.confidenceScore > 60 ? 'MEDIUM' : 'LOW',
          source: 'Gmail Integration',
          notes: `AI Analysis - Buyer Type: ${lead.buyerType || 'Unknown'}\nSignals: ${lead.buyerSignals.join(', ')}\nTimeline: ${lead.extractedInfo.timeline || 'Not specified'}\n\nOriginal Email Subject: ${lead.subject}`
        });

      if (error) throw error;

      toast({
        title: "Lead Added to CRM",
        description: `${lead.sender.name || lead.sender.email} has been added to your buyer database.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Add Lead",
        description: error.message || "Could not add lead to CRM.",
        variant: "destructive",
      });
    }
  };

  const formatBudgetDisplay = (budget?: { min?: number; max?: number }) => {
    if (!budget) return null;
    if (budget.min && budget.max) {
      return `$${budget.min.toLocaleString()} - $${budget.max.toLocaleString()}`;
    }
    if (budget.min) return `From $${budget.min.toLocaleString()}`;
    if (budget.max) return `Up to $${budget.max.toLocaleString()}`;
    return null;
  };

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Loading Gmail integration status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Gmail Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {authStatus?.authenticated ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 dark:text-green-400">Connected to Gmail</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 dark:text-red-400">Gmail Not Connected</span>
                </>
              )}
            </div>
            
            {authStatus?.authenticated ? (
              <Button variant="outline" onClick={disconnectGmail} size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <Button onClick={connectGmail} disabled={isConnecting} size="sm">
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Connect Gmail
              </Button>
            )}
          </div>
          
          {authStatus?.authenticated && authStatus.authenticatedAt && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connected: {new Date(authStatus.authenticatedAt).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search Configuration */}
      {authStatus?.authenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Email Lead Discovery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Keywords</label>
              <Textarea
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                placeholder="Enter keywords to search for buyer intent (e.g., real estate, investment, property)"
                className="min-h-[80px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate keywords with commas. AI will analyze emails containing these terms for buyer intent.
              </p>
            </div>
            
            <Button 
              onClick={searchEmails} 
              disabled={isSearching || !searchKeywords.trim()}
              className="w-full"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search for Buyer Leads
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {leads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Potential Buyer Leads ({leads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leads.map((lead, index) => (
              <div key={lead.id || index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{lead.sender.name || lead.sender.email.split('@')[0]}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {lead.sender.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={lead.confidenceScore >= 70 ? "default" : "secondary"}
                      className={lead.confidenceScore >= 70 ? "bg-green-100 text-green-800" : ""}
                    >
                      {lead.confidenceScore}% confidence
                    </Badge>
                    {lead.confidenceScore >= 70 && (
                      <Button size="sm" onClick={() => addLeadToCRM(lead)}>
                        Add to CRM
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-sm">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Subject: {lead.subject}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(lead.date).toLocaleDateString()}
                  </p>
                  {lead.buyerType && (
                    <p className="text-gray-600 dark:text-gray-400">
                      Buyer Type: {lead.buyerType}
                    </p>
                  )}
                </div>
                
                {lead.buyerSignals.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                    <p className="text-sm">
                      <span className="font-medium">Buyer Signals:</span> {lead.buyerSignals.join(', ')}
                    </p>
                  </div>
                )}
                
                {(lead.extractedInfo.location || lead.extractedInfo.budget || lead.extractedInfo.propertyTypes?.length) && (
                  <div className="flex flex-wrap gap-2">
                    {lead.extractedInfo.location && (
                      <Badge variant="outline">📍 {lead.extractedInfo.location}</Badge>
                    )}
                    {lead.extractedInfo.budget && (
                      <Badge variant="outline">💰 {formatBudgetDisplay(lead.extractedInfo.budget)}</Badge>
                    )}
                    {lead.extractedInfo.timeline && (
                      <Badge variant="outline">⏰ {lead.extractedInfo.timeline}</Badge>
                    )}
                    {lead.extractedInfo.propertyTypes?.map((type, i) => (
                      <Badge key={i} variant="outline">🏠 {type}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">How Gmail Integration Works</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• AI analyzes your emails for buyer intent using advanced language models</li>
                <li>• Searches based on keywords you specify (real estate, investment, property, etc.)</li>
                <li>• Extracts contact information and investment criteria automatically</li>
                <li>• Only processes emails from the last month for privacy</li>
                <li>• Qualified leads can be added directly to your CRM with one click</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GmailIntegration;