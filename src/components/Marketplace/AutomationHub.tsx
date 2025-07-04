
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Zap, 
  Target, 
  Bell, 
  TrendingUp, 
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { useMarketplace } from '@/contexts/MarketplaceContext';

const AutomationHub: React.FC = () => {
  const { 
    deals, 
    buyers, 
    savedSearches, 
    isAutoRefreshEnabled, 
    setAutoRefreshEnabled,
    runAutomatedMatching 
  } = useMarketplace();
  
  const [automationStats, setAutomationStats] = useState({
    dealsProcessed: 0,
    matchesFound: 0,
    alertsSent: 0,
    activeSearches: 0,
    lastRunTime: new Date().toLocaleTimeString()
  });

  const [activeAutomations, setActiveAutomations] = useState({
    dealMatching: true,
    savedSearchAlerts: true,
    buyerNotifications: true,
    marketAnalysis: true,
    priceTracking: false,
    competitiveIntel: false
  });

  useEffect(() => {
    // Update stats when data changes
    setAutomationStats(prev => ({
      ...prev,
      dealsProcessed: deals.length,
      activeSearches: savedSearches.filter(s => s.alertsEnabled).length,
      matchesFound: Math.floor(deals.length * 0.3), // Simulate matches
      alertsSent: savedSearches.reduce((acc, s) => acc + s.newResultsCount, 0)
    }));
  }, [deals, savedSearches]);

  const handleAutomationToggle = (key: string, enabled: boolean) => {
    setActiveAutomations(prev => ({ ...prev, [key]: enabled }));
  };

  const runManualAutomation = () => {
    runAutomatedMatching();
    setAutomationStats(prev => ({
      ...prev,
      lastRunTime: new Date().toLocaleTimeString(),
      matchesFound: prev.matchesFound + Math.floor(Math.random() * 5) + 1
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <span>Automation Hub</span>
          </h3>
          <p className="text-gray-600">Intelligent automation for deal matching and alerts</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-refresh">Auto Refresh</Label>
            <Switch
              id="auto-refresh" 
              checked={isAutoRefreshEnabled}
              onCheckedChange={setAutoRefreshEnabled}
            />
          </div>
          <Button onClick={runManualAutomation} className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Run Now</span>
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{automationStats.dealsProcessed}</p>
            <p className="text-sm text-gray-600">Deals Processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{automationStats.matchesFound}</p>
            <p className="text-sm text-gray-600">Matches Found</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{automationStats.alertsSent}</p>
            <p className="text-sm text-gray-600">Alerts Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium">{automationStats.lastRunTime}</p>
            <p className="text-sm text-gray-600">Last Run</p>
          </CardContent>
        </Card>
      </div>

      {/* Automation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Automation Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(activeAutomations).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {enabled ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {enabled ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => handleAutomationToggle(key, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Processes */}
      <Card>
        <CardHeader>
          <CardTitle>Active Automation Processes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bot className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">AI Deal Matching</p>
                  <p className="text-sm text-gray-600">Analyzing {deals.length} deals with {buyers.length} buyers</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={75} className="w-20" />
                <Badge className="bg-blue-600">Running</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Saved Search Alerts</p>
                  <p className="text-sm text-gray-600">{automationStats.activeSearches} active searches monitored</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={90} className="w-20" />
                <Badge className="bg-green-600">Active</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Market Analysis</p>
                  <p className="text-sm text-gray-600">Real-time price and trend monitoring</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={60} className="w-20" />
                <Badge className="bg-yellow-600">Processing</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Automation Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '2 min ago', action: 'New deal match found for Premium Buyer #1', type: 'match' },
              { time: '5 min ago', action: 'Alert sent for "Atlanta SFH Under 100K" search', type: 'alert' },
              { time: '8 min ago', action: 'Price drop detected on 3 deals', type: 'price' },
              { time: '12 min ago', action: 'AI matching completed for 47 deals', type: 'analysis' },
              { time: '15 min ago', action: '2 new deals added to comparison queue', type: 'comparison' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'match' ? 'bg-green-500' :
                  activity.type === 'alert' ? 'bg-blue-500' :
                  activity.type === 'price' ? 'bg-yellow-500' :
                  activity.type === 'analysis' ? 'bg-purple-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationHub;
