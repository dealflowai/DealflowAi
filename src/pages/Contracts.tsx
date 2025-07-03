
import React from 'react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Download, Edit, Eye, Clock } from 'lucide-react';

const contracts = [
  {
    id: 1,
    title: 'Purchase Agreement - 123 Oak Street',
    type: 'Purchase Agreement',
    status: 'Draft',
    buyer: 'Sarah Johnson',
    seller: 'Michael Thompson',
    amount: '$45,000',
    created: '2024-01-15',
    modified: '2024-01-16'
  },
  {
    id: 2,
    title: 'Assignment Contract - 456 Pine Avenue',
    type: 'Assignment',
    status: 'Signed',
    buyer: 'Jennifer Rodriguez',
    seller: 'David Chen',
    amount: '$67,500',
    created: '2024-01-10',
    modified: '2024-01-12'
  },
  {
    id: 3,
    title: 'LOI - Riverside Commercial',
    type: 'Letter of Intent',
    status: 'Pending',
    buyer: 'Investment Group LLC',
    seller: 'Commercial Properties Inc',
    amount: '$125,000',
    created: '2024-01-08',
    modified: '2024-01-14'
  },
  {
    id: 4,
    title: 'Purchase Agreement - 789 Elm Street',
    type: 'Purchase Agreement',
    status: 'Executed',
    buyer: 'Michael Chen',
    seller: 'Property Holdings Co',
    amount: '$89,000',
    created: '2024-01-05',
    modified: '2024-01-13'
  }
];

const contractTemplates = [
  {
    title: 'Purchase Agreement',
    description: 'Standard real estate purchase agreement for wholesale deals',
    icon: FileText
  },
  {
    title: 'Assignment Contract',
    description: 'Assignment of purchase agreement to end buyer',
    icon: FileText
  },
  {
    title: 'Letter of Intent',
    description: 'Non-binding offer letter for initial negotiations',
    icon: FileText
  },
  {
    title: 'Seller Disclosure',
    description: 'Property condition disclosure form',
    icon: FileText
  }
];

const Contracts = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Signed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Executed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
            <p className="text-gray-600 mt-1">Generate and manage your real estate contracts with AI</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contract Templates */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Templates</h2>
            <div className="space-y-3">
              {contractTemplates.map((template, index) => (
                <button
                  key={index}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex items-start space-x-3">
                    <template.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-900">{template.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Contracts */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Contracts</h2>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Last updated 2 hours ago</span>
              </div>
            </div>

            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{contract.title}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span>{contract.type}</span>
                        <span>•</span>
                        <span>{contract.amount}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Buyer:</span>
                      <span className="ml-2 font-medium text-gray-900">{contract.buyer}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Seller:</span>
                      <span className="ml-2 font-medium text-gray-900">{contract.seller}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Created: {contract.created} • Modified: {contract.modified}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button variant="outline">Load More Contracts</Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Signature</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">7</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Executed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">12</p>
              </div>
              <Badge className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                ✓
              </Badge>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">$2.1M</p>
              </div>
              <span className="text-green-600 text-sm font-medium">+15%</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contracts;
