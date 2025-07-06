
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { 
  Webhook, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

const ClerkWebhookHandler = () => {
  const webhookUrl = `${window.location.origin}/api/clerk-webhook`;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Webhook className="w-5 h-5 mr-2" />
            Clerk Integration Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Automatic User Provisioning</h4>
                <p className="text-sm text-blue-700 mt-1">
                  When users sign up through Clerk, they'll automatically be added to your admin dashboard with appropriate roles.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Webhook URL</label>
              <div className="flex space-x-2">
                <Input value={webhookUrl} readOnly className="flex-1" />
                <Button variant="outline" onClick={() => copyToClipboard(webhookUrl)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Add this URL to your Clerk dashboard webhooks
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Events to Subscribe</label>
                <div className="space-y-1">
                  <Badge variant="outline">user.created</Badge>
                  <Badge variant="outline">user.updated</Badge>
                  <Badge variant="outline">user.deleted</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Default Role</label>
                <Badge variant="secondary">user</Badge>
                <p className="text-xs text-gray-500">
                  New users will be assigned the 'user' role by default
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Setup Instructions</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Go to your Clerk Dashboard</li>
              <li>Navigate to Webhooks section</li>
              <li>Click "Add Endpoint"</li>
              <li>Paste the webhook URL above</li>
              <li>Select the events: user.created, user.updated, user.deleted</li>
              <li>Save the webhook configuration</li>
            </ol>
            
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Clerk Dashboard
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Security Note</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Make sure to verify webhook signatures in production to ensure requests are coming from Clerk.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClerkWebhookHandler;
