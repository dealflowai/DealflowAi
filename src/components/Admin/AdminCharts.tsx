
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface AdminChartsProps {
  timeframe: string;
}

const AdminCharts = ({ timeframe }: AdminChartsProps) => {
  // Mock data for charts - replace with real data from your API
  const userSignupData = [
    { month: 'Jan', signups: 45 },
    { month: 'Feb', signups: 52 },
    { month: 'Mar', signups: 38 },
    { month: 'Apr', signups: 65 },
    { month: 'May', signups: 78 },
    { month: 'Jun', signups: 89 }
  ];

  const dealVolumeData = [
    { day: 'Mon', deals: 12 },
    { day: 'Tue', deals: 19 },
    { day: 'Wed', deals: 15 },
    { day: 'Thu', deals: 22 },
    { day: 'Fri', deals: 28 },
    { day: 'Sat', deals: 18 },
    { day: 'Sun', deals: 14 }
  ];

  const tokenUsageData = [
    { name: 'GPT-4', value: 45, color: '#8b5cf6' },
    { name: 'GPT-3.5', value: 30, color: '#06b6d4' },
    { name: 'Claude', value: 15, color: '#10b981' },
    { name: 'Other', value: 10, color: '#f59e0b' }
  ];

  const topMarkets = [
    { market: 'Texas', deals: 145, percentage: 23 },
    { market: 'Florida', deals: 128, percentage: 20 },
    { market: 'California', deals: 112, percentage: 18 },
    { market: 'Georgia', deals: 89, percentage: 14 },
    { market: 'North Carolina', deals: 76, percentage: 12 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly User Signups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Monthly User Signups</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userSignupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="signups" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deal Volume Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Deal Volume Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dealVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="deals" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Token Usage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Token Usage by Model</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tokenUsageData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {tokenUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Buyer Markets */}
      <Card>
        <CardHeader>
          <CardTitle>Top Buyer Markets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topMarkets.map((market, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{market.market}</span>
                    <span className="text-sm text-gray-500">{market.deals} deals</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${market.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-4 text-sm font-medium text-gray-600">
                  {market.percentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCharts;
