
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Target } from 'lucide-react';

interface AdvancedAnalyticsProps {
  timeframe: string;
}

const AdvancedAnalytics = ({ timeframe }: AdvancedAnalyticsProps) => {
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Enhanced mock data for advanced analytics
  const revenueData = [
    { month: 'Jan', revenue: 45000, deals: 23, users: 120, conversion: 18.5 },
    { month: 'Feb', revenue: 52000, deals: 28, users: 145, conversion: 19.2 },
    { month: 'Mar', revenue: 38000, deals: 19, users: 132, conversion: 14.4 },
    { month: 'Apr', revenue: 65000, deals: 34, users: 178, conversion: 21.8 },
    { month: 'May', revenue: 78000, deals: 42, users: 203, conversion: 25.1 },
    { month: 'Jun', revenue: 89000, deals: 48, users: 234, conversion: 28.3 }
  ];

  const userBehaviorData = [
    { day: 'Mon', sessions: 1200, bounceRate: 35, avgSession: 4.2 },
    { day: 'Tue', sessions: 1450, bounceRate: 32, avgSession: 4.8 },
    { day: 'Wed', sessions: 1380, bounceRate: 28, avgSession: 5.1 },
    { day: 'Thu', sessions: 1620, bounceRate: 30, avgSession: 4.9 },
    { day: 'Fri', sessions: 1850, bounceRate: 25, avgSession: 5.4 },
    { day: 'Sat', sessions: 980, bounceRate: 38, avgSession: 3.8 },
    { day: 'Sun', sessions: 1100, bounceRate: 33, avgSession: 4.1 }
  ];

  const cohortData = [
    { cohort: 'Week 1', retention: 100, revenue: 1000 },
    { cohort: 'Week 2', retention: 85, revenue: 850 },
    { cohort: 'Week 3', retention: 72, revenue: 720 },
    { cohort: 'Week 4', retention: 65, revenue: 650 },
    { cohort: 'Week 5', retention: 58, revenue: 580 },
    { cohort: 'Week 6', retention: 52, revenue: 520 }
  ];

  const geographicData = [
    { region: 'North America', value: 45, color: '#3b82f6' },
    { region: 'Europe', value: 25, color: '#10b981' },
    { region: 'Asia Pacific', value: 20, color: '#f59e0b' },
    { region: 'Latin America', value: 7, color: '#ef4444' },
    { region: 'Other', value: 3, color: '#8b5cf6' }
  ];

  const performanceMetrics = [
    { 
      title: 'Customer Acquisition Cost', 
      value: '$127', 
      change: -12, 
      trend: 'down',
      icon: Users,
      color: 'text-green-600'
    },
    { 
      title: 'Lifetime Value', 
      value: '$2,340', 
      change: 18, 
      trend: 'up',
      icon: DollarSign,
      color: 'text-blue-600'
    },
    { 
      title: 'Monthly Recurring Revenue', 
      value: '$45,600', 
      change: 22, 
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    { 
      title: 'Churn Rate', 
      value: '2.3%', 
      change: -8, 
      trend: 'down',
      icon: Target,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Advanced KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="text-gray-600">{metric.title}</span>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <div className={`flex items-center space-x-1 ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">{Math.abs(metric.change)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue & Conversion Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Revenue & Deals Correlation</span>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="deals">Deals</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" opacity={0.7} />
                <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#10b981" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Behavior Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userBehaviorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stackId="1"
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Analysis & Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Retention Cohort</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cohort" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="retention" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-8">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={geographicData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {geographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="flex-1 space-y-3">
                {geographicData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.region}</span>
                    </div>
                    <Badge variant="outline">{item.value}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Heat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Days of week header */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
            
            {/* Sample heat map data */}
            {Array.from({ length: 28 }, (_, i) => {
              const intensity = Math.floor(Math.random() * 5) + 1;
              const bgColor = {
                1: 'bg-green-100',
                2: 'bg-green-200', 
                3: 'bg-green-300',
                4: 'bg-green-400',
                5: 'bg-green-500'
              }[intensity];
              
              return (
                <div 
                  key={i}
                  className={`h-8 rounded ${bgColor} cursor-pointer hover:scale-110 transition-transform`}
                  title={`Day ${i + 1}: ${intensity * 20}% activity`}
                ></div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <span>Less activity</span>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div 
                  key={i}
                  className={`w-3 h-3 rounded ${
                    ['bg-green-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500'][i]
                  }`}
                ></div>
              ))}
            </div>
            <span>More activity</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
