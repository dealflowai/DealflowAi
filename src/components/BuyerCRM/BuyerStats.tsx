
import { Card, CardContent } from "@/components/ui/card";
import { User, TrendingUp, DollarSign, Star, Calendar, Target } from "lucide-react";

interface Buyer {
  id: string;
  status: string | null;
  budget_min: number | null;
  budget_max: number | null;
  priority: string | null;
  created_at: string | null;
}

interface BuyerStatsProps {
  buyers: Buyer[];
}

const BuyerStats = ({ buyers }: BuyerStatsProps) => {
  const totalBuyers = buyers.length;
  const activeBuyers = buyers.filter(b => b.status === 'active').length;
  const newBuyers = buyers.filter(b => b.status === 'new').length;
  const qualifiedBuyers = buyers.filter(b => b.status === 'qualified').length;
  
  // Calculate average budget
  const buyersWithBudget = buyers.filter(b => b.budget_min && b.budget_max);
  const avgBudget = buyersWithBudget.length > 0 
    ? buyersWithBudget.reduce((sum, b) => sum + ((b.budget_min! + b.budget_max!) / 2), 0) / buyersWithBudget.length
    : 0;

  // High priority buyers
  const highPriorityBuyers = buyers.filter(b => 
    b.priority === 'HIGH' || b.priority === 'VERY HIGH'
  ).length;

  // Recent buyers (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentBuyers = buyers.filter(b => 
    b.created_at && new Date(b.created_at) > thirtyDaysAgo
  ).length;

  const stats = [
    {
      title: "Total Buyers",
      value: totalBuyers.toString(),
      icon: User,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      subtitle: `${newBuyers} new this month`
    },
    {
      title: "Active Buyers",
      value: activeBuyers.toString(),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: `${qualifiedBuyers} qualified`
    },
    {
      title: "Avg Budget",
      value: avgBudget > 0 ? `$${Math.round(avgBudget / 1000)}K` : "N/A",
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      subtitle: `${buyersWithBudget.length} with budget data`
    },
    {
      title: "High Priority",
      value: highPriorityBuyers.toString(),
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      subtitle: "Priority buyers"
    },
    {
      title: "Recent Adds",
      value: recentBuyers.toString(),
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      subtitle: "Last 30 days"
    },
    {
      title: "Conversion Rate",
      value: totalBuyers > 0 ? `${Math.round((qualifiedBuyers / totalBuyers) * 100)}%` : "0%",
      icon: Target,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
      subtitle: "To qualified status"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate">{stat.title}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BuyerStats;
