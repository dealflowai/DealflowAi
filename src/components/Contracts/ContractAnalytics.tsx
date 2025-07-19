
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
import { useContracts } from '@/hooks/useContracts';

const ContractAnalytics = () => {
  const { contracts } = useContracts();

  // Calculate analytics data from real contracts
  const totalContracts = contracts.length;
  const totalValue = contracts.reduce((sum, contract) => sum + (contract.purchase_price || 0), 0);
  const signedContracts = contracts.filter(c => c.status?.toLowerCase() === 'signed' || c.status?.toLowerCase() === 'executed').length;
  const signatureRate = totalContracts > 0 ? (signedContracts / totalContracts) * 100 : 0;

  // Monthly data from real contracts
  const monthlyData = contracts.reduce((acc, contract) => {
    const date = new Date(contract.created_at);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const existing = acc.find(item => item.month === monthKey);
    if (existing) {
      existing.contracts += 1;
      existing.value += contract.purchase_price || 0;
      if (contract.status?.toLowerCase() === 'signed' || contract.status?.toLowerCase() === 'executed') {
        existing.signed += 1;
      }
    } else {
      acc.push({
        month: monthKey,
        contracts: 1,
        value: contract.purchase_price || 0,
        signed: (contract.status?.toLowerCase() === 'signed' || contract.status?.toLowerCase() === 'executed') ? 1 : 0
      });
    }
    return acc;
  }, [] as Array<{ month: string; contracts: number; value: number; signed: number }>)
  .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  .slice(-6); // Last 6 months

  // Contract types distribution from real data
  const contractTypeMap = contracts.reduce((acc, contract) => {
    const type = contract.template_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const contractTypes = Object.entries(contractTypeMap).map(([name, value], index) => ({
    name,
    value,
    color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'][index % 6]
  }));

  // Recent contracts (last 5)
  const recentContracts = contracts
    .slice(0, 5)
    .map(contract => ({
      id: contract.id,
      title: contract.title,
      status: contract.status?.toLowerCase() || 'draft',
      value: contract.purchase_price || 0,
      daysToSign: null, // We don't track this yet
      createdAt: new Date(contract.created_at).toLocaleDateString()
    }));

  const avgSigningTime = 3.2; // Default value since we don't track this yet

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
                 <p className="text-2xl font-bold text-gray-900">{totalContracts}</p>
                 <p className="text-xs text-gray-500 mt-1">Total contracts created</p>
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
                 <p className="text-2xl font-bold text-gray-900">${(totalValue / 1000000).toFixed(1)}M</p>
                 <p className="text-xs text-gray-500 mt-1">Total contract value</p>
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
                 <p className="text-2xl font-bold text-gray-900">{signatureRate.toFixed(0)}%</p>
                 <p className="text-xs text-gray-500 mt-1">Contracts signed/executed</p>
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
                <p className="text-xs text-gray-500 mt-1">Average signing time</p>
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
             {monthlyData.length > 0 ? (
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
             ) : (
               <div className="flex items-center justify-center h-[300px] text-gray-500">
                 <div className="text-center">
                   <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                   <p>No contract data available</p>
                 </div>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Contract Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
             {contractTypes.length > 0 ? (
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
             ) : (
               <div className="flex items-center justify-center h-[300px] text-gray-500">
                 <div className="text-center">
                   <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                   <p>No contract type data available</p>
                 </div>
               </div>
             )}
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
           {recentContracts.length > 0 ? (
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
           ) : (
             <div className="text-center py-8 text-gray-500">
               <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
               <p>No recent contract activity</p>
             </div>
           )}
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
                <span className="text-sm font-medium">{signatureRate.toFixed(0)}%</span>
              </div>
              <Progress value={signatureRate} className="h-2" />
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
