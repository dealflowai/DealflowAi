
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Eye, 
  RefreshCw, 
  Ban, 
  Zap, 
  Mail, 
  MessageSquare,
  User,
  Database
} from 'lucide-react';

const AdminActions = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState('');
  const [actionType, setActionType] = useState('');
  const [actionDetails, setActionDetails] = useState('');

  const handleAdminAction = async (action: string) => {
    if (!selectedUser && action !== 'system') {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive"
      });
      return;
    }

    // Mock action - replace with actual implementation
    toast({
      title: "Action Executed",
      description: `${action} action completed successfully`,
    });
  };

  const adminActions = [
    {
      title: 'User Management',
      icon: User,
      actions: [
        { id: 'reset-password', label: 'Reset Password', icon: RefreshCw },
        { id: 'impersonate', label: 'Impersonate User', icon: Eye },
        { id: 'revoke-access', label: 'Revoke Access', icon: Ban },
        { id: 'view-profile', label: 'View Profile', icon: Shield }
      ]
    },
    {
      title: 'Credits & Tokens',
      icon: Zap,
      actions: [
        { id: 'issue-tokens', label: 'Issue Token Credit', icon: Zap },
        { id: 'reset-limits', label: 'Reset Usage Limits', icon: RefreshCw }
      ]
    },
    {
      title: 'Communications',
      icon: Mail,
      actions: [
        { id: 'send-email', label: 'Send Email', icon: Mail },
        { id: 'send-sms', label: 'Send SMS', icon: MessageSquare }
      ]
    },
    {
      title: 'System Actions',
      icon: Database,
      actions: [
        { id: 'clear-cache', label: 'Clear Cache', icon: RefreshCw },
        { id: 'backup-data', label: 'Backup Data', icon: Database }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select User for Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user-select">User Email or ID</Label>
              <Input
                id="user-select"
                placeholder="Enter user email or ID"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="action-type">Action Type</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User Management</SelectItem>
                  <SelectItem value="tokens">Token Management</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="system">System Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="action-details">Action Details</Label>
            <Textarea
              id="action-details"
              placeholder="Additional details or message for the action..."
              value={actionDetails}
              onChange={(e) => setActionDetails(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {adminActions.map((category, categoryIndex) => {
          const CategoryIcon = category.icon;
          
          return (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CategoryIcon className="h-5 w-5" />
                  <span>{category.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {category.actions.map((action, actionIndex) => {
                    const ActionIcon = action.icon;
                    
                    return (
                      <AlertDialog key={actionIndex}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="justify-start h-auto p-4"
                            disabled={!selectedUser && action.id !== 'clear-cache' && action.id !== 'backup-data'}
                          >
                            <ActionIcon className="h-4 w-4 mr-3" />
                            <div className="text-left">
                              <div className="font-medium">{action.label}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {action.id === 'reset-password' && 'Generate new password for user'}
                                {action.id === 'impersonate' && 'Login as this user (audit logged)'}
                                {action.id === 'revoke-access' && 'Disable user account access'}
                                {action.id === 'view-profile' && 'View detailed user information'}
                                {action.id === 'issue-tokens' && 'Add token credits to user account'}
                                {action.id === 'reset-limits' && 'Reset daily/monthly usage limits'}
                                {action.id === 'send-email' && 'Send custom email notification'}
                                {action.id === 'send-sms' && 'Send SMS via Twilio integration'}
                                {action.id === 'clear-cache' && 'Clear system cache and refresh data'}
                                {action.id === 'backup-data' && 'Create database backup'}
                              </div>
                            </div>
                          </Button>
                        </AlertDialogTrigger>
                        
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center space-x-2">
                              <ActionIcon className="h-5 w-5" />
                              <span>Confirm {action.label}</span>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to {action.label.toLowerCase()} 
                              {selectedUser && ` for user: ${selectedUser}`}?
                              {action.id === 'impersonate' && ' This action will be logged for security purposes.'}
                              {action.id === 'revoke-access' && ' This will immediately disable the user account.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleAdminAction(action.id)}
                              className={action.id === 'revoke-access' ? 'bg-red-600 hover:bg-red-700' : ''}
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: 'user', message: 'New user registered: john@example.com', time: '2 minutes ago' },
              { type: 'deal', message: 'New deal posted in Austin, TX - $250K', time: '5 minutes ago' },
              { type: 'payment', message: 'Payment failed for user@domain.com', time: '8 minutes ago' },
              { type: 'system', message: 'Database backup completed successfully', time: '12 minutes ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'user' ? 'bg-green-500' :
                  activity.type === 'deal' ? 'bg-blue-500' :
                  activity.type === 'payment' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActions;
