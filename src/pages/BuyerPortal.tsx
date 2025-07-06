
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Eye, Download, DollarSign, MapPin, Calendar } from 'lucide-react';

const BuyerPortal = () => {
  const [criteria, setCriteria] = useState({
    budget_min: '',
    budget_max: '',
    markets: '',
    property_types: '',
    investment_criteria: ''
  });

  const recentDeals = [
    {
      id: 1,
      address: '123 Oak Street',
      city: 'Atlanta',
      state: 'GA',
      price: 45000,
      arv: 85000,
      status: 'Available',
      created_at: '2024-01-15'
    },
    {
      id: 2,
      address: '456 Pine Avenue',
      city: 'Birmingham',
      state: 'AL',
      price: 67500,
      arv: 120000,
      status: 'Under Contract',
      created_at: '2024-01-10'
    }
  ];

  const handleSubmitCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting criteria:', criteria);
    // TODO: Submit to Supabase
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Portal</h1>
          <p className="text-gray-600">Manage your investment criteria and browse available deals</p>
        </div>

        {/* Investment Criteria Form */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitCriteria} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_min">Minimum Budget</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    placeholder="50000"
                    value={criteria.budget_min}
                    onChange={(e) => setCriteria({ ...criteria, budget_min: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max">Maximum Budget</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    placeholder="200000"
                    value={criteria.budget_max}
                    onChange={(e) => setCriteria({ ...criteria, budget_max: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="markets">Target Markets</Label>
                <Input
                  id="markets"
                  placeholder="Atlanta, Birmingham, Nashville"
                  value={criteria.markets}
                  onChange={(e) => setCriteria({ ...criteria, markets: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="property_types">Property Types</Label>
                <Input
                  id="property_types"
                  placeholder="Single Family, Duplex, Condo"
                  value={criteria.property_types}
                  onChange={(e) => setCriteria({ ...criteria, property_types: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="investment_criteria">Investment Criteria</Label>
                <Textarea
                  id="investment_criteria"
                  placeholder="Describe your investment goals and criteria..."
                  value={criteria.investment_criteria}
                  onChange={(e) => setCriteria({ ...criteria, investment_criteria: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                Update Criteria
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Deals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeals.map((deal) => (
                <div key={deal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{deal.address}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{deal.city}, {deal.state}</span>
                      </div>
                    </div>
                    <Badge variant={deal.status === 'Available' ? 'default' : 'secondary'}>
                      {deal.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">List Price</p>
                        <p className="font-semibold">${deal.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">ARV</p>
                        <p className="font-semibold">${deal.arv.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-500">Added</p>
                        <p className="font-semibold">{deal.created_at}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-3 h-3 mr-1" />
                      Contract
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerPortal;
