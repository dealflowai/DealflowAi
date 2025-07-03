
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, DollarSign, Calendar, Users, Plus } from 'lucide-react';

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const deals = [
    {
      id: 1,
      title: '3BR/2BA Single Family Home',
      address: '1234 Oak Street, Atlanta, GA',
      price: 85000,
      arv: 120000,
      type: 'Wholesale',
      postedDate: '2 days ago',
      poster: 'Mike Johnson',
      status: 'Active'
    },
    {
      id: 2,
      title: 'Duplex Investment Property',
      address: '5678 Pine Ave, Birmingham, AL',
      price: 65000,
      arv: 95000,
      type: 'Assignment',
      postedDate: '1 week ago',
      poster: 'Sarah Wilson',
      status: 'Under Contract'
    },
    {
      id: 3,
      title: 'Fix & Flip Opportunity',
      address: '9012 Maple Dr, Nashville, TN',
      price: 45000,
      arv: 85000,
      type: 'Wholesale',
      postedDate: '3 days ago',
      poster: 'David Chen',
      status: 'Active'
    }
  ];

  const buyerRequests = [
    {
      id: 1,
      buyer: 'Jennifer Smith',
      criteria: 'SFH $50K-$100K in Metro Atlanta',
      budget: '50K - 100K',
      type: 'Single Family',
      location: 'Atlanta Metro',
      postedDate: '1 day ago'
    },
    {
      id: 2,
      buyer: 'Robert Davis',
      criteria: 'Multi-family properties in Birmingham',
      budget: '75K - 150K',
      type: 'Multi-family',
      location: 'Birmingham, AL',
      postedDate: '4 days ago'
    }
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-600 mt-1">Connect with buyers and sellers in your network</p>
          </div>
          <Button className="gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Post Deal
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search deals, locations, or buyers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="deals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="deals">Available Deals</TabsTrigger>
            <TabsTrigger value="buyers">Buyer Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="deals" className="space-y-4">
            <div className="grid gap-4">
              {deals.map((deal) => (
                <Card key={deal.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{deal.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {deal.address}
                        </CardDescription>
                      </div>
                      <Badge variant={deal.status === 'Active' ? 'default' : 'secondary'}>
                        {deal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Contract Price</p>
                        <p className="font-semibold text-green-600">${deal.price.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ARV</p>
                        <p className="font-semibold">${deal.arv.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Deal Type</p>
                        <p className="font-semibold">{deal.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Posted</p>
                        <p className="font-semibold">{deal.postedDate}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">Posted by {deal.poster}</span>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button size="sm">Contact Seller</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buyers" className="space-y-4">
            <div className="grid gap-4">
              {buyerRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{request.buyer}</CardTitle>
                        <CardDescription className="mt-1">{request.criteria}</CardDescription>
                      </div>
                      <Badge variant="outline">{request.postedDate}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Budget Range</p>
                        <p className="font-semibold text-green-600">${request.budget}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Property Type</p>
                        <p className="font-semibold">{request.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold">{request.location}</p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">View Profile</Button>
                      <Button size="sm">Send Deal</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Marketplace;
