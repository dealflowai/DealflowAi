
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDeals } from '@/hooks/useDeals';
import { MapPin, DollarSign, TrendingUp, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Deal = Tables<'deals'>;

const DealPipeline: React.FC = () => {
  const { data: deals, isLoading, error } = useDeals();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offer_sent': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'contracted': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'dead': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'New Lead';
      case 'contacted': return 'Contacted';
      case 'offer_sent': return 'Offer Sent';
      case 'contracted': return 'Under Contract';
      case 'closed': return 'Closed';
      case 'dead': return 'Dead';
      default: return status;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your deals...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-red-600">Error loading deals: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Deals Yet</h3>
          <p className="text-gray-500">Start by searching and analyzing properties to build your deal pipeline</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Deal Pipeline</h2>
        <div className="text-sm text-gray-600">
          {deals.length} total deals
        </div>
      </div>

      <div className="space-y-4">
        {deals.map((deal) => (
          <Card key={deal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{deal.address}</h3>
                  <p className="text-gray-600 flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4" />
                    {deal.city}, {deal.state} {deal.zip_code}
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(deal.status || 'new')}>
                      {getStatusLabel(deal.status || 'new')}
                    </Badge>
                    {deal.deal_type && (
                      <Badge variant="outline">{deal.deal_type}</Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  {deal.ai_score && (
                    <div className="mb-2">
                      <span className={`text-2xl font-bold ${getScoreColor(deal.ai_score)}`}>
                        {deal.ai_score}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">AI Score</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    {deal.created_at && new Date(deal.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">List Price</div>
                  <div className="font-semibold">
                    {deal.list_price ? `$${deal.list_price.toLocaleString()}` : 'N/A'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">ARV</div>
                  <div className="font-semibold">
                    {deal.arv ? `$${deal.arv.toLocaleString()}` : 'N/A'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Max Offer</div>
                  <div className="font-semibold">
                    {deal.max_offer ? `$${deal.max_offer.toLocaleString()}` : 'N/A'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Profit</div>
                  <div className={`font-semibold ${
                    deal.margin && deal.margin > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {deal.margin ? `$${deal.margin.toLocaleString()}` : 'N/A'}
                  </div>
                </div>
              </div>

              {deal.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700 line-clamp-2">{deal.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Last updated: {deal.updated_at && new Date(deal.updated_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DealPipeline;
