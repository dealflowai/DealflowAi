
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Download, Edit, Eye, Clock, BarChart3, Wand2, Send, BookOpen } from 'lucide-react';
import ContractGenerator from '@/components/Contracts/ContractGenerator';
import ESignatureWorkflow from '@/components/Contracts/ESignatureWorkflow';
import TemplateLibrary from '@/components/Contracts/TemplateLibrary';
import ContractAnalytics from '@/components/Contracts/ContractAnalytics';

const initialContracts = [
  {
    id: 1,
    title: 'Purchase Agreement - 123 Oak Street',
    template_type: 'Purchase Agreement',
    status: 'Draft',
    buyer_name: 'Sarah Johnson',
    buyer_email: 'sarah.johnson@email.com',
    seller_name: 'Michael Thompson',
    seller_email: 'michael.thompson@email.com',
    purchase_price: 45000,
    earnest_money: 1000,
    property_address: '123 Oak Street',
    created_at: '2024-01-15',
    closing_date: '2024-02-15'
  },
  {
    id: 2,
    title: 'Assignment Contract - 456 Pine Avenue',
    template_type: 'Assignment',
    status: 'Signed',
    buyer_name: 'Jennifer Rodriguez',
    buyer_email: 'jennifer.rodriguez@email.com',
    seller_name: 'David Chen',
    seller_email: 'david.chen@email.com',
    purchase_price: 67500,
    earnest_money: 2000,
    property_address: '456 Pine Avenue',
    created_at: '2024-01-10',
    closing_date: '2024-02-10'
  },
  {
    id: 3,
    title: 'LOI - Riverside Commercial',
    template_type: 'Letter of Intent',
    status: 'Pending',
    buyer_name: 'Investment Group LLC',
    buyer_email: 'contact@investmentgroup.com',
    seller_name: 'Commercial Properties Inc',
    seller_email: 'sales@commercialproperties.com',
    purchase_price: 125000,
    earnest_money: 5000,
    property_address: 'Riverside Commercial Complex',
    created_at: '2024-01-08',
    closing_date: '2024-03-01'
  },
  {
    id: 4,
    title: 'Purchase Agreement - 789 Elm Street',
    template_type: 'Purchase Agreement',
    status: 'Executed',
    buyer_name: 'Michael Chen',
    buyer_email: 'michael.chen@email.com',
    seller_name: 'Property Holdings Co',
    seller_email: 'info@propertyholdings.com',
    purchase_price: 89000,
    earnest_money: 3000,
    property_address: '789 Elm Street',
    created_at: '2024-01-05',
    closing_date: '2024-01-30'
  }
];

const Contracts = () => {
  const [contracts, setContracts] = useState(initialContracts);
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Signed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Executed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleContractGenerated = (newContract: any) => {
    setContracts(prev => [newContract, ...prev]);
  };

  const handleStatusUpdate = (contractId: string, newStatus: string) => {
    setContracts(prev => 
      prev.map(contract => 
        contract.id.toString() === contractId 
          ? { ...contract, status: newStatus }
          : contract
      )
    );
  };

  const handleTemplateSelect = (template: any) => {
    // Switch to generator tab and pre-fill template type
    setActiveTab('generator');
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Contract Management</h1>
            <p className="text-gray-600 mt-1">AI-powered contract generation, e-signatures, and analytics</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setActiveTab('templates')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Templates
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              onClick={() => setActiveTab('generator')}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Contract
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4" />
              <span>AI Generator</span>
            </TabsTrigger>
            <TabsTrigger value="signatures" className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>E-Signatures</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                    <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Signature</p>
                    <p className="text-2xl font-bold text-yellow-600">{contracts.filter(c => c.status === 'Pending').length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Executed</p>
                    <p className="text-2xl font-bold text-green-600">{contracts.filter(c => c.status === 'Executed').length}</p>
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
                    <p className="text-2xl font-bold text-gray-900">
                      ${(contracts.reduce((sum, c) => sum + (c.purchase_price || 0), 0) / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <span className="text-green-600 text-sm font-medium">+15%</span>
                </div>
              </div>
            </div>

            {/* Recent Contracts */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
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
                          <span>{contract.template_type}</span>
                          <span>•</span>
                          <span>${contract.purchase_price?.toLocaleString()}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Buyer:</span>
                        <span className="ml-2 font-medium text-gray-900">{contract.buyer_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Seller:</span>
                        <span className="ml-2 font-medium text-gray-900">{contract.seller_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Created: {contract.created_at} • Closing: {contract.closing_date}
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
            </div>
          </TabsContent>

          <TabsContent value="generator">
            <ContractGenerator onContractGenerated={handleContractGenerated} />
          </TabsContent>

          <TabsContent value="signatures">
            <ESignatureWorkflow 
              contracts={contracts} 
              onStatusUpdate={handleStatusUpdate}
            />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateLibrary onTemplateSelect={handleTemplateSelect} />
          </TabsContent>

          <TabsContent value="analytics">
            <ContractAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Contracts;
