
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Brain,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { useMarketplace } from '@/contexts/MarketplaceContext';

const IntegratedDashboard: React.FC = () => {
  const { deals, buyers, savedSearches, comparisonDeals, selectedDeals } = useMarketplace();

  // Analytics data
  const dealsByType = [
    { name: 'Fix & Flip', value: 35, count: 35 },
    { name: 'Buy & Hold', value: 28, count: 28 },
    { name: 'Wholesale', value: 22, count: 22 },
    { name: 'BRRRR', value: 15, count: 15 }
  ];

  const roiTrends = [
    { month: 'Jan', avgROI: 18, deals: 42 },
    { month: 'Feb', avgROI: 22, deals: 38 },
    { month: 'Mar', avgROI: 25, deals: 45 },
    { month: 'Apr', avgROI: 28, deals: 52 },
    { month: 'May', avgROI: 24, deals: 48 },
    { month: 'Jun', avgROI: 30, deals: 55 }
  ];

  const buyerActivity = [
    { name: 'Active', value: 68, color: '#10B981' },
    { name: 'Interested', value: 24, color: '#F59E0B' },
    { name: 'Inactive', value: 8, color: '#EF4444' }
  ];

  const topDeals = deals.slice(0, 5).map(deal => ({
    ...deal,
    score: Math.floor(Math.random() * 40) + 60
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold">{deals.length}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% this month
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Buyers</p>
                <p className="text-2xl font-bold">{buyers.length}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <Users className="w-3 h-3 mr-1" />
                  +8% this week
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg ROI</p>
                <p className="text-2xl font-bold">26.4%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.1% vs last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Matches</p>
                <p className="text-2xl font-bold">{Math.floor(deals.length * 0.7)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <Brain className="w-3 h-3 mr-1" />
                  85% accuracy
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">Top Deals</TabsTrigger>
          <TabsTrigger value="buyers">Buyers</TabsTrigger>
          <TabsTrigger value="matches">AI Matches</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>ROI Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={roiTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgROI" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dealsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dealsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topDeals.map((deal, index) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{deal.title}</p>
                        <p className="text-sm text-gray-600">{deal.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{deal.roiEstimate}% ROI</p>
                      <p className="text-sm text-gray-600">${deal.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buyers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Buyer Activity Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={buyerActivity}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {buyerActivity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Buyers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {buyers.slice(0, 5).map((buyer, index) => (
                    <div key={buyer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          {buyer.buyer.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{buyer.buyer}</p>
                          <div className="flex items-center space-x-2">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{buyer.buyerRating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{buyer.dealsClosed} deals</p>
                        <p className="text-xs text-gray-600">{buyer.budget}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Matching Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">87%</p>
                  <p className="text-sm text-gray-600">Match Accuracy</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{Math.floor(deals.length * 0.6)}</p>
                  <p className="text-sm text-gray-600">Active Matches</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">2.3s</p>
                  <p className="text-sm text-gray-600">Avg Match Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedSearches.filter(s => s.alertsEnabled).map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{search.name}</p>
                        <p className="text-sm text-gray-600">Last run: {search.lastRun}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {search.newResultsCount > 0 && (
                        <Badge variant="default" className="bg-red-500">
                          {search.newResultsCount} new
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegratedDashboard;
