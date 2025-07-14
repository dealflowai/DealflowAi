import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Loader2, User, Calendar, CheckCircle, XCircle, RefreshCw, Settings, Search, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EmailLead {
  sender: string;
  subject: string;
  content: string;
  date: string;
  buyerIntent: boolean;
  confidence: number;
  analysis: string;
  extractedInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    budget?: string;
    propertyTypes?: string[];
  };
}

const GmailIntegration = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchKeywords, setSearchKeywords] = useState('real estate, investment, property, cash buyer, investor');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [leads, setLeads] = useState<EmailLead[]>([]);

  // Check Gmail auth status
  const { data: authStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['gmail-auth-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase.functions.invoke('gmail-integration', {
        body: { action: 'status' }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const connectGmail = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-integration', {
        body: { action: 'auth' }
      });
      
      if (error) throw error;
      
      if (data.authUrl) {
        // Open Google OAuth flow
        window.open(data.authUrl, '_blank', 'width=500,height=600');
        
        // Listen for message from popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GMAIL_AUTH_SUCCESS') {
            window.removeEventListener('message', messageListener);
            queryClient.invalidateQueries({ queryKey: ['gmail-auth-status'] });
            toast({
              title: "Gmail Connected!",
              description: "Successfully connected your Gmail account.",
            });
          }
        };
        
        window.addEventListener('message', messageListener);
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
      const { error } = await supabase.functions.invoke('gmail-integration', {
        body: { action: 'revoke' }
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
    if (!authStatus?.connected) {
      toast({
        title: "Gmail Not Connected",
        description: "Please connect your Gmail account first.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-integration', {
        body: { 
          action: 'search',
          keywords: searchKeywords.split(',').map(k => k.trim()),
          maxResults: 50,
          filters: {
            timeRange: '30d', // Last 30 days
            hasAttachments: false
          }
        }
      });
      
      if (error) throw error;
      
      setLeads(data.leads || []);
      
      toast({
        title: "Email Search Complete",
        description: `Found ${data.leads?.length || 0} potential buyer leads.`,
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

      const { error } = await supabase
        .from('buyers')
        .insert({
          owner_id: profile.id,
          name: lead.extractedInfo.name || lead.sender.split('<')[0].trim(),
          email: lead.extractedInfo.email || lead.sender.match(/<([^>]+)>/)?.[1],
          phone: lead.extractedInfo.phone,
          location_focus: lead.extractedInfo.location,
          budget_min: lead.extractedInfo.budget ? parseInt(lead.extractedInfo.budget.replace(/[^\d]/g, '')) : null,
          property_type_interest: lead.extractedInfo.propertyTypes,
          status: 'new',
          priority: lead.confidence > 0.8 ? 'HIGH' : lead.confidence > 0.6 ? 'MEDIUM' : 'LOW',
          source: 'Gmail Integration',
          notes: `AI Analysis: ${lead.analysis}\n\nOriginal Email Subject: ${lead.subject}`
        });

      if (error) throw error;

      toast({
        title: "Lead Added to CRM",
        description: `${lead.extractedInfo.name || 'Lead'} has been added to your buyer database.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Add Lead",
        description: error.message || "Could not add lead to CRM.",
        variant: "destructive",
      });
    }
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
              {authStatus?.connected ? (
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
            
            {authStatus?.connected ? (
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
          
          {authStatus?.connected && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last connected: {new Date(authStatus.connectedAt).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search Configuration */}
      {authStatus?.connected && (
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
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{lead.extractedInfo.name || lead.sender.split('<')[0].trim()}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {lead.extractedInfo.email || lead.sender.match(/<([^>]+)>/)?.[1]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={lead.buyerIntent ? "default" : "secondary"}
                      className={lead.buyerIntent ? "bg-green-100 text-green-800" : ""}
                    >
                      {Math.round(lead.confidence * 100)}% confidence
                    </Badge>
                    {lead.buyerIntent && (
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
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                  <p className="text-sm">
                    <span className="font-medium">AI Analysis:</span> {lead.analysis}
                  </p>
                </div>
                
                {(lead.extractedInfo.location || lead.extractedInfo.budget || lead.extractedInfo.propertyTypes?.length) && (
                  <div className="flex flex-wrap gap-2">
                    {lead.extractedInfo.location && (
                      <Badge variant="outline">📍 {lead.extractedInfo.location}</Badge>
                    )}
                    {lead.extractedInfo.budget && (
                      <Badge variant="outline">💰 {lead.extractedInfo.budget}</Badge>
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
                <li>• Only processes emails from the last 30 days for privacy</li>
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