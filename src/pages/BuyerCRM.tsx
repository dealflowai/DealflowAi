
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, MoreHorizontal, Phone, Mail, MapPin } from 'lucide-react';

const buyers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    location: 'Los Angeles, CA',
    assetTypes: ['Land', 'SFH'],
    budgetRange: '$30K - $80K',
    status: 'Active',
    motivationScore: 9,
    lastContact: '2 days ago',
    notes: 'Prefers rural land deals, quick closer'
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'mchen@investments.com',
    phone: '(555) 987-6543',
    location: 'Phoenix, AZ',
    assetTypes: ['Multifamily', 'Commercial'],
    budgetRange: '$100K - $500K',
    status: 'Active',
    motivationScore: 8,
    lastContact: '1 week ago',
    notes: 'Looking for cash flow properties'
  },
  {
    id: 3,
    name: 'Jennifer Rodriguez',
    email: 'jen.rodriguez@gmail.com',
    phone: '(555) 456-7890',
    location: 'Austin, TX',
    assetTypes: ['SFH', 'Duplex'],
    budgetRange: '$50K - $150K',
    status: 'Warm',
    motivationScore: 7,
    lastContact: '3 days ago',
    notes: 'First-time investor, needs guidance'
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david@kimrealty.com',
    phone: '(555) 321-0987',
    location: 'Denver, CO',
    assetTypes: ['Land', 'Commercial'],
    budgetRange: '$75K - $200K',
    status: 'Cold',
    motivationScore: 5,
    lastContact: '2 weeks ago',
    notes: 'Seasonal buyer, active in Q4'
  }
];

const BuyerCRM = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Warm':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cold':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMotivationColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyer CRM</h1>
            <p className="text-gray-600 mt-1">Manage your qualified cash buyers and their preferences</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Buyer
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search buyers by name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buyers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {buyers.map((buyer) => (
            <div key={buyer.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{buyer.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getStatusColor(buyer.status)}>
                      {buyer.status}
                    </Badge>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMotivationColor(buyer.motivationScore)}`}>
                      Score: {buyer.motivationScore}/10
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{buyer.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{buyer.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{buyer.location}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Asset Types:</p>
                <div className="flex flex-wrap gap-1">
                  {buyer.assetTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Budget Range:</p>
                <p className="text-sm text-gray-600">{buyer.budgetRange}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 italic">"{buyer.notes}"</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">Last contact: {buyer.lastContact}</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State or Load More */}
        <div className="text-center py-8">
          <Button variant="outline">Load More Buyers</Button>
        </div>
      </div>
    </Layout>
  );
};

export default BuyerCRM;
