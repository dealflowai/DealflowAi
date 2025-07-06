
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Mail, 
  Ban, 
  CheckCircle, 
  Upload, 
  Download,
  Trash2,
  Edit,
  Send,
  FileText
} from 'lucide-react';

const BulkOperations = () => {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock user data
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', role: 'user' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', role: 'user' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', status: 'active', role: 'admin' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', status: 'pending', role: 'user' },
    { id: '5', name: 'Tom Brown', email: 'tom@example.com', status: 'active', role: 'user' }
  ];

  const bulkActions = [
    { id: 'send-email', label: 'Send Email Campaign', icon: Mail },
    { id: 'change-status', label: 'Change User Status', icon: Users },
    { id: 'export-data', label: 'Export User Data', icon: Download },
    { id: 'delete-users', label: 'Delete Users', icon: Trash2 },
    { id: 'assign-role', label: 'Assign Role', icon: Edit }
  ];

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select users and an action",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    toast({
      title: "Bulk Operation Completed",
      description: `${bulkAction} applied to ${selectedUsers.length} users`,
    });

    setIsProcessing(false);
    setProgress(0);
    setSelectedUsers([]);
    setBulkAction('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Bulk Action Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Bulk Operations Center</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Action</label>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose bulk action" />
                </SelectTrigger>
                <SelectContent>
                  {bulkActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <SelectItem key={action.id} value={action.id}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{action.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {selectedUsers.length} selected
              </Badge>
              <Button 
                onClick={handleBulkAction}
                disabled={isProcessing || selectedUsers.length === 0 || !bulkAction}
                className="min-w-32"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Execute
                  </>
                )}
              </Button>
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Processing bulk operation...</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-medium mb-2">Import Users</h3>
            <p className="text-sm text-gray-600">Upload CSV file to bulk import users</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <h3 className="font-medium mb-2">Generate Reports</h3>
            <p className="text-sm text-gray-600">Create detailed user activity reports</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 mx-auto mb-3 text-purple-600" />
            <h3 className="font-medium mb-2">Email Templates</h3>
            <p className="text-sm text-gray-600">Manage bulk email campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* User Selection Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>User Selection</span>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedUsers.length === users.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm">Select All</label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div 
                key={user.id} 
                className={`p-4 rounded-lg border transition-colors ${
                  selectedUsers.includes(user.id) 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleUserSelect(user.id, checked as boolean)}
                    />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                    <Badge variant="secondary">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operation History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bulk Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'Email Campaign', users: 150, date: '2 hours ago', status: 'completed' },
              { action: 'Role Assignment', users: 25, date: '1 day ago', status: 'completed' },
              { action: 'User Export', users: 300, date: '2 days ago', status: 'completed' },
              { action: 'Status Update', users: 75, date: '3 days ago', status: 'failed' }
            ].map((operation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    operation.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium">{operation.action}</div>
                    <div className="text-sm text-gray-600">{operation.users} users affected</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{operation.date}</div>
                  <Badge variant={operation.status === 'completed' ? 'default' : 'destructive'}>
                    {operation.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkOperations;
