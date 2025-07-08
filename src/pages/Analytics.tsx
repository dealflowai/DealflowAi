
import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, Target, Calendar, MapPin, 
  BarChart3, PieChart as PieChartIcon, Activity, Clock,
  AlertTriangle, CheckCircle, Eye, Star, Filter,
  Download, Share2, RefreshCw, Zap, Brain, TrendingDown,
  Award, Globe, Building, Home, Calculator, Percent
} from 'lucide-react';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('6M');
  const [selectedMetric, setSelectedMetric] = useState('deals');
  const [viewType, setViewType] = useState('overview');
  const [activeTab, setActiveTab] = useState('overview');
  const [dataMode, setDataMode] = useState<'actual' | 'projected'>('actual');

  // Enhanced mock data with more comprehensive metrics
  const monthlyPerformance = [
    { month: 'Jan', deals: 12, revenue: 45000, roi: 28, leads: 156, conversions: 24, avgDays: 18 },
    { month: 'Feb', deals: 15, revenue: 52000, roi: 32, leads: 189, conversions: 31, avgDays: 16 },
    { month: 'Mar', deals: 18, revenue: 68000, roi: 35, leads: 201, conversions: 38, avgDays: 14 },
    { month: 'Apr', deals: 22, revenue: 82000, roi: 38, leads: 234, conversions: 45, avgDays: 12 },
    { month: 'May', deals: 25, revenue: 95000, roi: 42, leads: 267, conversions: 52, avgDays: 11 },
    { month: 'Jun', deals: 28, revenue: 105000, roi: 45, leads: 298, conversions: 58, avgDays: 10 }
  ];

  const dealTypes = [
    { name: 'Wholesale', value: 45, color: '#3b82f6', profit: 125000 },
    { name: 'Assignment', value: 30, color: '#10b981', profit: 85000 },
    { name: 'Fix & Flip', value: 25, color: '#f59e0b', profit: 95000 }
  ];

  const marketAnalysis = [
    { city: 'Atlanta, GA', deals: 28, avgPrice: 75000, roi: 35, growth: 12.5, inventory: 145 },
    { city: 'Birmingham, AL', deals: 22, avgPrice: 65000, roi: 42, growth: 8.2, inventory: 98 },
    { city: 'Nashville, TN', deals: 18, avgPrice: 85000, roi: 28, growth: 15.1, inventory: 87 },
    { city: 'Charlotte, NC', deals: 15, avgPrice: 95000, roi: 25, growth: 6.8, inventory: 76 },
    { city: 'Memphis, TN', deals: 12, avgPrice: 55000, roi: 48, growth: 18.3, inventory: 124 }
  ];

  const performanceMetrics = [
    { metric: 'Conversion Rate', value: 24.5, change: 3.2, trend: 'up' },
    { metric: 'Avg Deal Size', value: 3750, change: -2.1, trend: 'down' },
    { metric: 'Pipeline Velocity', value: 14, change: 8.5, trend: 'up' },
    { metric: 'Customer Acquisition Cost', value: 245, change: -5.8, trend: 'down' }
  ];

  const predictiveData = [
    { month: 'Jul', predicted: 32, confidence: 85, actual: null },
    { month: 'Aug', predicted: 35, confidence: 78, actual: null },
    { month: 'Sep', predicted: 38, confidence: 72, actual: null },
    { month: 'Oct', predicted: 41, confidence: 68, actual: null }
  ];

  const competitorAnalysis = [
    { competitor: 'BigCorp Real Estate', marketShare: 28, deals: 450, avgPrice: 125000 },
    { competitor: 'Local Investors LLC', marketShare: 18, deals: 290, avgPrice: 95000 },
    { competitor: 'Quick Flip Partners', marketShare: 15, deals: 240, avgPrice: 85000 },
    { competitor: 'Metro Property Group', marketShare: 12, deals: 195, avgPrice: 105000 }
  ];

  const riskAssessment = [
    { factor: 'Market Volatility', score: 6.2, impact: 'Medium', trend: 'stable' },
    { factor: 'Interest Rates', score: 7.8, impact: 'High', trend: 'increasing' },
    { factor: 'Inventory Levels', score: 4.1, impact: 'Low', trend: 'decreasing' },
    { factor: 'Competition', score: 5.9, impact: 'Medium', trend: 'increasing' }
  ];

  const totalMetrics = useMemo(() => {
    const totalDeals = monthlyPerformance.reduce((sum, month) => sum + month.deals, 0);
    const totalRevenue = monthlyPerformance.reduce((sum, month) => sum + month.revenue, 0);
    const avgROI = Math.round(monthlyPerformance.reduce((sum, month) => sum + month.roi, 0) / monthlyPerformance.length);
    const totalLeads = monthlyPerformance.reduce((sum, month) => sum + month.leads, 0);
    
    return { totalDeals, totalRevenue, avgROI, totalLeads };
  }, [monthlyPerformance]);

  const getRiskColor = (score: number) => {
    if (score >= 7) return 'text-red-600 bg-red-50';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center space-x-3">
              <BarChart3 className="w-10 h-10 text-blue-600" />
              <span>Advanced Analytics</span>
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                AI-Powered
              </Badge>
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive insights and predictive analytics for your real estate portfolio</p>
          </div>
          <div className="flex space-x-3">
            <div className="flex border rounded-lg bg-background">
              <Button
                variant={dataMode === 'actual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDataMode('actual')}
                className="rounded-r-none"
              >
                Actual
              </Button>
              <Button
                variant={dataMode === 'projected' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDataMode('projected')}
                className="rounded-l-none"
              >
                Projected
              </Button>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">Last Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="6M">6 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
                <SelectItem value="ALL">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Deals</CardTitle>
              <Target className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalMetrics.totalDeals}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+22% from last period</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">Pipeline: 45 active</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">${(totalMetrics.totalRevenue / 1000).toFixed(0)}K</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+18% from last period</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Projected: ${((totalMetrics.totalRevenue * 1.2) / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Average ROI</CardTitle>
              <Percent className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{totalMetrics.avgROI}%</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+3.2% from last period</span>
              </div>
              <p className="text-xs text-purple-600 mt-1">Industry avg: 28%</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Lead Generation</CardTitle>
              <Users className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{totalMetrics.totalLeads}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+15% from last period</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">Conversion: 24.5%</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-4xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="competition">Competition</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>Revenue & Deal Trends</span>
                  </CardTitle>
                  <CardDescription>Monthly performance with dual metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={monthlyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => [
                        name === 'revenue' ? `$${value.toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Deals'
                      ]} />
                      <Bar yAxisId="left" dataKey="deals" fill="#3b82f6" name="deals" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="revenue" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChartIcon className="w-5 h-5 text-purple-600" />
                    <span>Deal Type Distribution</span>
                  </CardTitle>
                  <CardDescription>Portfolio breakdown with profitability</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dealTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dealTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [
                        `${value}% (${props.payload?.profit ? `$${props.payload.profit.toLocaleString()}` : 'N/A'})`,
                        name
                      ]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-3">
                    {dealTypes.map((type, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3" 
                            style={{ backgroundColor: type.color }}
                          />
                          <span className="font-medium">{type.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{type.value}%</div>
                          <div className="text-sm text-gray-500">${type.profit.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {performanceMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{metric.metric}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {metric.metric.includes('Cost') || metric.metric.includes('Size') 
                          ? `$${metric.value.toLocaleString()}` 
                          : metric.metric.includes('Rate') 
                            ? `${metric.value}%` 
                            : `${metric.value} days`
                        }
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(metric.trend)}
                        <span className={`ml-1 text-sm font-medium ${
                          metric.change > 0 && metric.trend === 'up' ? 'text-green-600' : 
                          metric.change < 0 && metric.trend === 'down' ? 'text-green-600' : 
                          'text-red-600'
                        }`}>
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ROI Performance Over Time</CardTitle>
                  <CardDescription>Track return on investment trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'ROI']} />
                      <Area type="monotone" dataKey="roi" stroke="#8b5cf6" fill="url(#roiGradient)" />
                      <defs>
                        <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                  <CardDescription>Lead to deal conversion analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyPerformance} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="month" type="category" />
                      <Tooltip />
                      <Bar dataKey="leads" fill="#e11d48" name="Leads" />
                      <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Deal Velocity Analysis</CardTitle>
                <CardDescription>Average days from lead to closing</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} days`, 'Avg Days to Close']} />
                    <Line type="monotone" dataKey="avgDays" stroke="#f59e0b" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>Market Performance Dashboard</span>
                </CardTitle>
                <CardDescription>Comprehensive analysis of your active markets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {marketAnalysis.map((market, index) => (
                    <div key={index} className="border rounded-lg p-6 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center">
                            <Building className="w-5 h-5 mr-2 text-blue-600" />
                            {market.city}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>#{index + 1} Market</span>
                            <Badge variant={market.growth > 10 ? 'default' : 'secondary'}>
                              {market.growth > 10 ? 'Hot Market' : 'Stable'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-600">{market.deals}</div>
                          <div className="text-sm text-gray-500">deals closed</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">${market.avgPrice.toLocaleString()}</div>
                          <div className="text-xs text-gray-600">Avg Price</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{market.roi}%</div>
                          <div className="text-xs text-gray-600">Avg ROI</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">+{market.growth}%</div>
                          <div className="text-xs text-gray-600">Growth Rate</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-lg font-bold text-orange-600">{market.inventory}</div>
                          <div className="text-xs text-gray-600">Inventory</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <span>AI Deal Predictions</span>
                  </CardTitle>
                  <CardDescription>Machine learning forecasts for upcoming months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[...monthlyPerformance.slice(-3), ...predictiveData]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="deals" stroke="#3b82f6" strokeWidth={2} name="Historical" />
                      <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeDasharray="5 5" strokeWidth={2} name="Predicted" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {predictiveData.map((pred, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                        <span className="font-medium">{pred.month}</span>
                        <div className="flex items-center space-x-2">
                          <span>{pred.predicted} deals</span>
                          <Badge variant="outline" className="text-xs">
                            {pred.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Trend Analysis</CardTitle>
                  <CardDescription>Predictive insights and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Opportunity Identified</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Atlanta market showing 15% growth potential. Consider increasing inventory by 20%.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-800">Market Watch</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Birmingham showing seasonal slowdown. Normal pattern for Q3.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">AI Recommendation</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Focus on wholesale deals in Nashville for optimal ROI this quarter.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Competition Tab */}
          <TabsContent value="competition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-gold-600" />
                  <span>Competitive Analysis</span>
                </CardTitle>
                <CardDescription>Market positioning and competitor insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitorAnalysis.map((competitor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{competitor.competitor}</h3>
                          <p className="text-sm text-gray-600">{competitor.deals} deals • Avg ${competitor.avgPrice.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{competitor.marketShare}%</div>
                        <div className="text-sm text-gray-500">Market Share</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Analysis Tab */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Risk Assessment Matrix</span>
                  </CardTitle>
                  <CardDescription>Current market risk factors and mitigation strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskAssessment.map((risk, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{risk.factor}</h3>
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(risk.score)}`}>
                              {risk.score}/10
                            </div>
                            {getTrendIcon(risk.trend)}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Impact: {risk.impact}</span>
                          <span>Trend: {risk.trend}</span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              risk.score >= 7 ? 'bg-red-500' : 
                              risk.score >= 5 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${risk.score * 10}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Mitigation Strategies</CardTitle>
                  <CardDescription>Recommended actions to minimize portfolio risk</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Diversification</h4>
                      <p className="text-sm text-blue-700">
                        Consider expanding to 2-3 additional markets to reduce concentration risk.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Interest Rate Hedge</h4>
                      <p className="text-sm text-green-700">
                        Lock in financing rates for upcoming deals to protect against rate increases.
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Market Timing</h4>
                      <p className="text-sm text-purple-700">
                        Monitor inventory levels closely and adjust acquisition pace accordingly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analytics;
