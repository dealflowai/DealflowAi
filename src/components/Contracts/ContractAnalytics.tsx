
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  FileText, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const ContractAnalytics = () => {
  // Mock data for analytics
  const monthlyData = [
    { month: 'Jan', contracts: 12, value: 450000, signed: 8 },
    { month: 'Feb', contracts: 15, value: 680000, signed: 12 },
    { month: 'Mar', contracts: 18, value: 720000, signed: 14 },
    { month: 'Apr', contracts: 22, value: 890000, signed: 18 },
    { month: 'May', contracts: 25, value: 1200000, signed: 20 },
    { month: 'Jun', contracts: 28, value: 1350000, signed: 24 }
  ];

  const contractTypes = [
    { name: 'Purchase Agreement', value: 45, color: '#8884d8' },
    { name: 'Assignment', value: 30, color: '#82ca9d' },
    { name: 'LOI', value: 15, color: '#ffc658' },
    { name: 'Option Contract', value: 10, color: '#ff7300' }
  ];

  const recentContracts = [
    {
      id: '1',
      title: '123 Oak Street Purchase Agreement',
      status: 'signed',
      value: 85000,
      daysToSign: 3,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Pine Ave Assignment Contract',
      status: 'pending',
      value: 65000,
      daysToSign: null,
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      title: 'Maple Dr LOI',
      status: 'draft',
      value: 45000,
      daysToSign: null,
      createdAt: '2024-01-13'
    }
  ];

  const avgSigningTime = recentContracts
    .filter(c => c.daysToSign !== null)
    .reduce((acc, c) => acc + (c.daysToSign || 0), 0) / 
    recentContracts.filter(c => c.daysToSign !== null).length || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'draft': return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900">120</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">$4.2M</p>
                <p className="text-xs text-green-600 mt-1">+18% from last month</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signature Rate</p>
                <p className="text-2xl font-bold text-gray-900">86%</p>
                <p className="text-xs text-green-600 mt-1">+5% from last month</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Sign Time</p>
                <p className="text-2xl font-bold text-gray-900">{avgSigningTime.toFixed(1)} days</p>
                <p className="text-xs text-red-600 mt-1">-1.2 days from last month</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Monthly Contract Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="contracts" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Contracts Created"
                />
                <Line 
                  type="monotone" 
                  dataKey="signed" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Contracts Signed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contract Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contractTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contractTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Contracts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span>Recent Contract Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentContracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(contract.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">{contract.title}</h4>
                    <p className="text-sm text-gray-500">Created on {contract.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${contract.value.toLocaleString()}</p>
                    {contract.daysToSign && (
                      <p className="text-sm text-gray-500">Signed in {contract.daysToSign} days</p>
                    )}
                  </div>
                  <Badge className={getStatusColor(contract.status)}>
                    {contract.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-sm font-medium">86%</span>
              </div>
              <Progress value={86} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Response</span>
                <span className="text-sm font-medium">2.3 hrs</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Overall Rating</span>
                <span className="text-sm font-medium">4.8/5</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractAnalytics;
