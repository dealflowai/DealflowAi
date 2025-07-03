
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Phone, Mail, MapPin, DollarSign, TrendingUp, Star, Eye, MessageSquare, User, Building, Calendar, Target, Filter, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Buyer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  markets: string[] | null;
  asset_types: string[] | null;
  property_type_interest: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  priority: string | null;
  status: string | null;
  financing_type: string | null;
  investment_criteria: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_contacted: string | null;
  notes: string | null;
  tags: string[] | null;
}

interface BuyersListProps {
  buyers: Buyer[];
  searchQuery: string;
  selectedStatus: string;
  selectedPriority: string;
}

const BuyersList = ({ buyers, searchQuery, selectedStatus, selectedPriority }: BuyersListProps) => {
  const [sortBy, setSortBy] = useState<'name' | 'budget' | 'created' | 'priority' | 'status'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Enhanced filtering
  const filteredBuyers = useMemo(() => {
    return buyers.filter(buyer => {
      const matchesSearch = !searchQuery || 
        buyer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        buyer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        buyer.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        buyer.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        buyer.markets?.some(market => market.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = selectedStatus === 'All' || buyer.status === selectedStatus.toLowerCase();
      const matchesPriority = selectedPriority === 'All' || buyer.priority === selectedPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [buyers, searchQuery, selectedStatus, selectedPriority]);

  // Enhanced sorting
  const sortedBuyers = useMemo(() => {
    return [...filteredBuyers].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'budget':
          aValue = a.budget_max || 0;
          bValue = b.budget_max || 0;
          break;
        case 'created':
          aValue = new Date(a.created_at || '').getTime();
          bValue = new Date(b.created_at || '').getTime();
          break;
        case 'priority':
          const priorityOrder = { 'VERY HIGH': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          const statusOrder = { 'qualified': 5, 'active': 4, 'contacted': 3, 'new': 2, 'cold': 1 };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredBuyers, sortBy, sortOrder]);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'qualified':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cold':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'new':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toUpperCase()) {
      case 'VERY HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBudgetRange = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget not specified';
    if (!min) return `Up to $${max?.toLocaleString()}`;
    if (!max) return `From $${min?.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const calculateBuyerScore = (buyer: Buyer) => {
    let score = 0;
    
    // Contact completeness
    if (buyer.email) score += 20;
    if (buyer.phone) score += 20;
    if (buyer.name) score += 10;
    
    // Budget defined
    if (buyer.budget_min && buyer.budget_max) score += 15;
    
    // Priority level
    switch (buyer.priority) {
      case 'VERY HIGH': score += 15; break;
      case 'HIGH': score += 10; break;
      case 'MEDIUM': score += 5; break;
    }
    
    // Status
    switch (buyer.status) {
      case 'qualified': score += 15; break;
      case 'active': score += 10; break;
      case 'contacted': score += 5; break;
    }
    
    // Investment criteria defined
    if (buyer.investment_criteria) score += 5;
    
    return Math.min(score, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Date Added</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{sortedBuyers.length} buyers</span>
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Buyers Display */}
      {sortedBuyers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No buyers found</h3>
            <p className="text-gray-600">
              {buyers.length === 0 ? 'Add your first buyer to get started!' : 'No buyers match your search criteria.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {sortedBuyers.map((buyer) => {
            const buyerScore = calculateBuyerScore(buyer);
            
            return (
              <Card key={buyer.id} className="hover:shadow-lg transition-all duration-200 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {buyer.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{buyer.name || 'Unnamed Buyer'}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(buyer.status)}>
                            {buyer.status || 'new'}
                          </Badge>
                          {buyer.priority && (
                            <Badge className={getPriorityColor(buyer.priority)}>
                              {buyer.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className={`text-xs font-bold ${getScoreColor(buyerScore)} cursor-help`}>
                            {buyerScore}%
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-48">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Buyer Quality Score</h4>
                            <Progress value={buyerScore} className="h-2" />
                            <div className="text-xs text-gray-600">
                              Based on contact info, budget, priority, and engagement level
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Contact Information */}
                    {buyer.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{buyer.email}</span>
                      </div>
                    )}
                    
                    {buyer.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{buyer.phone}</span>
                      </div>
                    )}

                    {/* Location */}
                    {(buyer.city || buyer.state || buyer.markets) && (
                      <div className="flex items-start space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          {buyer.city && buyer.state ? (
                            <div>{buyer.city}, {buyer.state}</div>
                          ) : (
                            <div>{buyer.city || buyer.state || ''}</div>
                          )}
                          {buyer.markets && buyer.markets.length > 0 && (
                            <div className="text-xs text-gray-500">
                              Markets: {buyer.markets.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Budget Range */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span>{formatBudgetRange(buyer.budget_min, buyer.budget_max)}</span>
                    </div>

                    {/* Financing Type */}
                    {buyer.financing_type && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Building className="w-4 h-4 flex-shrink-0" />
                        <span>{buyer.financing_type}</span>
                      </div>
                    )}
                  </div>

                  {/* Asset Types */}
                  {buyer.asset_types && buyer.asset_types.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Asset Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {buyer.asset_types.map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Property Types */}
                  {buyer.property_type_interest && buyer.property_type_interest.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Property Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {buyer.property_type_interest.map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investment Criteria */}
                  {buyer.investment_criteria && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Investment Criteria:</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{buyer.investment_criteria}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {buyer.tags && buyer.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {buyer.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions and Footer */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      Added: {getTimeAgo(buyer.created_at)}
                    </span>
                    <div className="flex space-x-2">
                      {buyer.phone && (
                        <Button variant="outline" size="sm">
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                      )}
                      {buyer.email && (
                        <Button variant="outline" size="sm">
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BuyersList;
