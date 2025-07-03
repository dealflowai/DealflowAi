
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, TrendingUp, DollarSign, Star, Calendar, Target, Zap, Phone, Mail, MapPin, Building, Filter, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface Buyer {
  id: string;
  status: string | null;
  budget_min: number | null;
  budget_max: number | null;
  priority: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_contacted: string | null;
  city: string | null;
  state: string | null;
  markets: string[] | null;
  asset_types: string[] | null;
  property_type_interest: string[] | null;
  financing_type: string | null;
  email: string | null;
  phone: string | null;
  name: string | null;
}

interface BuyerStatsProps {
  buyers: Buyer[];
}

const BuyerStats = ({ buyers }: BuyerStatsProps) => {
  const [animatedStats, setAnimatedStats] = useState<Record<string, number>>({});

  // Calculate comprehensive stats
  const totalBuyers = buyers.length;
  const activeBuyers = buyers.filter(b => b.status === 'active').length;
  const newBuyers = buyers.filter(b => b.status === 'new').length;
  const qualifiedBuyers = buyers.filter(b => b.status === 'qualified').length;
  const contactedBuyers = buyers.filter(b => b.status === 'contacted').length;
  
  // Advanced analytics
  const highPriorityBuyers = buyers.filter(b => 
    b.priority === 'HIGH' || b.priority === 'VERY HIGH'
  ).length;

  // Recent activity analysis
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentBuyers = buyers.filter(b => 
    b.created_at && new Date(b.created_at) > thirtyDaysAgo
  ).length;

  // Contact info completeness
  const buyersWithEmail = buyers.filter(b => b.email).length;
  const buyersWithPhone = buyers.filter(b => b.phone).length;
  const completeContacts = buyers.filter(b => b.email && b.phone && b.name).length;

  // Budget analysis
  const buyersWithBudget = buyers.filter(b => b.budget_min && b.budget_max);
  const avgBudget = buyersWithBudget.length > 0 
    ? buyersWithBudget.reduce((sum, b) => sum + ((b.budget_min! + b.budget_max!) / 2), 0) / buyersWithBudget.length
    : 0;

  const totalBudgetCapacity = buyersWithBudget.reduce((sum, b) => sum + (b.budget_max || 0), 0);

  // Market analysis
  const marketCoverage = new Set(
    buyers.flatMap(b => b.markets || []).concat(
      buyers.map(b => b.city).filter(Boolean) as string[]
    )
  ).size;

  // Asset type analysis
  const assetTypeCoverage = new Set(
    buyers.flatMap(b => b.asset_types || [])
  ).size;

  // Conversion rates
  const conversionRate = totalBuyers > 0 ? (qualifiedBuyers / totalBuyers) * 100 : 0;
  const responseRate = totalBuyers > 0 ? (contactedBuyers / totalBuyers) * 100 : 0;

  // Stale buyers (no contact in 60+ days)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const staleBuyers = buyers.filter(b => 
    !b.last_contacted || new Date(b.last_contacted) < sixtyDaysAgo
  ).length;

  // Data quality score
  const dataQualityScore = totalBuyers > 0 ? 
    Math.round((completeContacts / totalBuyers) * 100) : 0;

  // Animate stats on mount
  useEffect(() => {
    const stats = {
      totalBuyers,
      activeBuyers,
      avgBudget: Math.round(avgBudget),
      conversionRate: Math.round(conversionRate),
      highPriorityBuyers,
      recentBuyers,
      marketCoverage,
      dataQualityScore
    };

    // Animate numbers
    Object.entries(stats).forEach(([key, finalValue]) => {
      let current = 0;
      const increment = finalValue / 20;
      const timer = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
          current = finalValue;
          clearInterval(timer);
        }
        setAnimatedStats(prev => ({ ...prev, [key]: Math.round(current) }));
      }, 50);
    });
  }, [buyers]);

  const stats = [
    {
      title: "Total Buyers",
      value: animatedStats.totalBuyers || 0,
      icon: User,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      subtitle: `${newBuyers} new this month`,
      trend: recentBuyers > 0 ? `+${recentBuyers} recently` : 'No recent adds',
      trendColor: recentBuyers > 0 ? 'text-green-600' : 'text-gray-500'
    },
    {
      title: "Active Pipeline",
      value: activeBuyers,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: `${qualifiedBuyers} qualified`,
      trend: `${Math.round(responseRate)}% response rate`,
      trendColor: responseRate > 50 ? 'text-green-600' : responseRate > 25 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      title: "Avg Budget",
      value: avgBudget > 0 ? `$${Math.round((animatedStats.avgBudget || avgBudget) / 1000)}K` : "N/A",
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      subtitle: `$${Math.round(totalBudgetCapacity / 1000000)}M total capacity`,
      trend: `${buyersWithBudget.length} with budget data`,
      trendColor: 'text-gray-600'
    },
    {
      title: "High Priority",
      value: animatedStats.highPriorityBuyers || highPriorityBuyers,
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      subtitle: "Hot prospects",
      trend: staleBuyers > 0 ? `${staleBuyers} need follow-up` : 'All current',
      trendColor: staleBuyers > 0 ? 'text-orange-600' : 'text-green-600'
    },
    {
      title: "Market Coverage",
      value: animatedStats.marketCoverage || marketCoverage,
      icon: MapPin,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      subtitle: "Markets served",
      trend: `${assetTypeCoverage} asset types`,
      trendColor: 'text-gray-600'
    },
    {
      title: "Conversion Rate",
      value: `${animatedStats.conversionRate || Math.round(conversionRate)}%`,
      icon: Target,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
      subtitle: "To qualified status",
      trend: conversionRate > 20 ? 'Above average' : 'Needs improvement',
      trendColor: conversionRate > 20 ? 'text-green-600' : 'text-orange-600'
    },
    {
      title: "Data Quality",
      value: `${animatedStats.dataQualityScore || dataQualityScore}%`,
      icon: Phone,
      color: "text-rose-600",
      bgColor: "bg-rose-100",
      subtitle: "Complete profiles",
      trend: `${completeContacts}/${totalBuyers} complete`,
      trendColor: dataQualityScore > 80 ? 'text-green-600' : dataQualityScore > 60 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      title: "This Month",
      value: recentBuyers,
      icon: Calendar,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      subtitle: "New additions",
      trend: recentBuyers > 5 ? 'Strong growth' : recentBuyers > 0 ? 'Steady pace' : 'Slow period',
      trendColor: recentBuyers > 5 ? 'text-green-600' : recentBuyers > 0 ? 'text-yellow-600' : 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Action Alerts */}
      {staleBuyers > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">
                  {staleBuyers} buyers need follow-up
                </p>
                <p className="text-xs text-orange-600">
                  These buyers haven't been contacted in 60+ days
                </p>
              </div>
              <button className="text-xs text-orange-700 hover:text-orange-900 font-medium">
                Review →
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats Grid - Better sizing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  <p className={`text-xs font-medium mt-1 ${stat.trendColor}`}>
                    {stat.trend}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Quality Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Contact Data Quality</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Email Addresses</span>
                <span className="text-xs font-medium">{buyersWithEmail}/{totalBuyers}</span>
              </div>
              <Progress value={totalBuyers > 0 ? (buyersWithEmail / totalBuyers) * 100 : 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Phone Numbers</span>
                <span className="text-xs font-medium">{buyersWithPhone}/{totalBuyers}</span>
              </div>
              <Progress value={totalBuyers > 0 ? (buyersWithPhone / totalBuyers) * 100 : 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Complete Profiles</span>
                <span className="text-xs font-medium">{completeContacts}/{totalBuyers}</span>
              </div>
              <Progress value={dataQualityScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Buyer Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { status: 'new', count: newBuyers, color: 'bg-blue-500' },
              { status: 'active', count: activeBuyers, color: 'bg-green-500' },
              { status: 'qualified', count: qualifiedBuyers, color: 'bg-purple-500' },
              { status: 'contacted', count: contactedBuyers, color: 'bg-yellow-500' }
            ].map(({ status, count, color }) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${color}`}></div>
                  <span className="text-xs capitalize text-gray-600">{status}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Conversion Rate</span>
              <span className={`text-xs font-medium ${conversionRate > 20 ? 'text-green-600' : 'text-orange-600'}`}>
                {Math.round(conversionRate)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Response Rate</span>
              <span className={`text-xs font-medium ${responseRate > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                {Math.round(responseRate)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Avg Deal Size</span>
              <span className="text-xs font-medium text-gray-900">
                ${avgBudget > 0 ? Math.round(avgBudget / 1000) : 0}K
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Pipeline Value</span>
              <span className="text-xs font-medium text-green-600">
                ${Math.round(totalBudgetCapacity / 1000000)}M
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerStats;
