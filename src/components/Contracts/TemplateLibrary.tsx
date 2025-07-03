
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Eye, Download, Copy, TrendingUp, Search } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  usageCount: number;
  lastUsed: string;
  complexity: 'Simple' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Standard Purchase Agreement',
    category: 'Purchase Agreement',
    description: 'Standard real estate purchase agreement for wholesale deals with standard terms and conditions.',
    usageCount: 45,
    lastUsed: '2024-01-15',
    complexity: 'Simple',
    estimatedTime: '15 min'
  },
  {
    id: '2',
    name: 'Assignment Contract - Standard',
    category: 'Assignment',
    description: 'Assignment of purchase agreement to end buyer with standard assignment clauses.',
    usageCount: 32,
    lastUsed: '2024-01-14',
    complexity: 'Intermediate',
    estimatedTime: '20 min'
  },
  {
    id: '3',
    name: 'Letter of Intent - Commercial',
    category: 'Letter of Intent',
    description: 'Non-binding offer letter for commercial property negotiations with detailed terms.',
    usageCount: 18,
    lastUsed: '2024-01-12',
    complexity: 'Advanced',
    estimatedTime: '30 min'
  },
  {
    id: '4',
    name: 'Seller Disclosure Form',
    category: 'Disclosure',
    description: 'Comprehensive property condition disclosure form for sellers.',
    usageCount: 28,
    lastUsed: '2024-01-13',
    complexity: 'Simple',
    estimatedTime: '10 min'
  },
  {
    id: '5',
    name: 'Option to Purchase Contract',
    category: 'Option Contract',
    description: 'Option contract giving buyer the right to purchase within specified timeframe.',
    usageCount: 15,
    lastUsed: '2024-01-10',
    complexity: 'Intermediate',
    estimatedTime: '25 min'
  },
  {
    id: '6',
    name: 'Lease Option Agreement',
    category: 'Lease Option',
    description: 'Combined lease and option agreement for rent-to-own scenarios.',
    usageCount: 12,
    lastUsed: '2024-01-08',
    complexity: 'Advanced',
    estimatedTime: '35 min'
  }
];

interface TemplateLibraryProps {
  onTemplateSelect: (template: Template) => void;
}

const TemplateLibrary = ({ onTemplateSelect }: TemplateLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('usage');

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAndSortedTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        default:
          return 0;
      }
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <span>Template Library</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usage">Most Used</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="recent">Recently Used</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSortedTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                </div>
                <Badge className={getComplexityColor(template.complexity)}>
                  {template.complexity}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {template.usageCount} uses
                  </span>
                  <span>⏱️ {template.estimatedTime}</span>
                </div>
                <span>Last used: {template.lastUsed}</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => onTemplateSelect(template)}
                  size="sm"
                  className="flex-1"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Use Template
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No templates found matching your criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateLibrary;
