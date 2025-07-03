
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, FileText, DollarSign, Calendar, Users } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', contracts: 12, value: 540000, signed: 8 },
  { month: 'Feb', contracts: 15, value: 675000, signed: 11 },
  { month: 'Mar', contracts: 18, value: 810000, signed: 14 },
  { month: 'Apr', contracts: 22, value: 990000, signed: 18 },
  { month: 'May', contracts: 19, value: 855000, signed: 15 },
  { month: 'Jun', contracts: 24, value: 1080000, signed: 20 }
];

const contractTypeData = [
  { name: 'Purchase Agreement', value: 45, color: '#3B82F6' },
  { name: 'Assignment', value: 32, color: '#10B981' },
  { name: 'Letter of Intent', value: 18, color: '#F59E0B' },
  { name: 'Disclosure', value: 28, color: '#EF4444' },
  { name: 'Option Contract', value: 15, color: '#8B5CF6' }
];

const signatureData = [
  { stage: 'Draft', count: 8, percentage: 15 },
  { stage: 'Sent', count: 12, percentage: 22 },
  { stage: 'Pending', count: 18, percentage: 33 },
  { stage: 'Signed', count: 16, percentage: 30 }
];

const ContractAnalytics = () => {
  const totalContracts = monthlyData.reduce((sum, month) => sum + month.contracts, 0);
  const totalValue = monthlyData.reduce((sum, month) => sum + month.value, 0);
  const totalSigned = monthlyData.reduce((sum, month) => sum + month.signed, 0);
  const signatureRate = Math.round((totalSigned / totalContracts) * 100);
  const avgContractValue = Math.round(totalValue / totalContracts);
  const avgTimeToSign = 5.2; // days

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900">{totalContracts}</p>
                <p className="text-xs text-green-600 mt-1">+18% from last month</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signature Rate</p>
                <p className="text-2xl font-bold text-gray-900">{signatureRate}%</p>
                <p className="text-xs text-green-600 mt-1">+5% from last month</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${(totalValue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-600 mt-1">+25% from last month</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Time to Sign</p>
                <p className="text-2xl font-bold text-gray-900">{avgTimeToSign} days</p>
                <p className="text-xs text-red-600 mt-1">+0.8 days from last month</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Monthly Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="contracts" fill="#3B82F6" name="Total Contracts" />
                <Bar dataKey="signed" fill="#10B981" name="Signed Contracts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contract Value Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Contract Value Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${(value / 1000).toFixed(0)}K`, 'Value']} />
                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>Contract Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contractTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contractTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Signature Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-yellow-600" />
              <span>Signature Pipeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signatureData.map((stage, index) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                    <span className="text-sm text-gray-600">{stage.count} contracts</span>
                  </div>
                  <Progress value={stage.percentage} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">{stage.percentage}% of total</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Performance Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Top Performing Template</span>
              </div>
              <p className="text-sm text-green-700">Purchase Agreement has the highest signature rate at 89%</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">Improvement Opportunity</span>
              </div>
              <p className="text-sm text-yellow-700">Letter of Intent templates take 40% longer to sign</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">Monthly Goal</span>
              </div>
              <p className="text-sm text-blue-700">83% towards 30 contract goal for this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractAnalytics;
