
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Bell, 
  Plus, 
  Trash2, 
  Edit2, 
  MapPin,
  DollarSign,
  Home,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SavedSearch {
  id: string;
  name: string;
  criteria: {
    searchTerm: string;
    priceRange: [number, number];
    states: string[];
    types: string[];
    minROI?: number;
  };
  alertsEnabled: boolean;
  createdAt: string;
  lastRun: string;
  newResultsCount: number;
}

interface SavedSearchesProps {
  onApplySearch: (criteria: any) => void;
}

const SavedSearches: React.FC<SavedSearchesProps> = ({ onApplySearch }) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    {
      id: '1',
      name: 'Atlanta SFH Under 100K',
      criteria: {
        searchTerm: 'Atlanta',
        priceRange: [0, 100000],
        states: ['GA'],
        types: ['Single Family'],
        minROI: 25
      },
      alertsEnabled: true,
      createdAt: '2024-01-10',
      lastRun: '2024-01-15',
      newResultsCount: 3
    },
    {
      id: '2',
      name: 'Multi-family Southeast',
      criteria: {
        searchTerm: '',
        priceRange: [50000, 200000],
        states: ['GA', 'AL', 'TN'],
        types: ['Multi-family'],
        minROI: 20
      },
      alertsEnabled: false,
      createdAt: '2024-01-08',
      lastRun: '2024-01-14',
      newResultsCount: 0
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [newSearchName, setNewSearchName] = useState('');

  const handleSaveCurrentSearch = (currentCriteria: any) => {
    if (!newSearchName.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: newSearchName,
      criteria: currentCriteria,
      alertsEnabled: true,
      createdAt: new Date().toISOString().split('T')[0],
      lastRun: new Date().toISOString().split('T')[0],
      newResultsCount: 0
    };

    setSavedSearches(prev => [...prev, newSearch]);
    setNewSearchName('');
    setIsCreateDialogOpen(false);
  };

  const handleDeleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
  };

  const handleToggleAlerts = (id: string) => {
    setSavedSearches(prev => 
      prev.map(search => 
        search.id === id 
          ? { ...search, alertsEnabled: !search.alertsEnabled }
          : search
      )
    );
  };

  const formatCriteria = (criteria: SavedSearch['criteria']) => {
    const parts = [];
    
    if (criteria.searchTerm) parts.push(`Search: "${criteria.searchTerm}"`);
    if (criteria.priceRange[1] > 0) parts.push(`$${criteria.priceRange[0].toLocaleString()} - $${criteria.priceRange[1].toLocaleString()}`);
    if (criteria.states.length > 0) parts.push(`States: ${criteria.states.join(', ')}`);
    if (criteria.types.length > 0) parts.push(`Types: ${criteria.types.join(', ')}`);
    if (criteria.minROI) parts.push(`Min ROI: ${criteria.minROI}%`);
    
    return parts;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Saved Searches</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Save Current Search</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Search</DialogTitle>
              <DialogDescription>
                Give your search a name to save it for future use and get alerts on new matches.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="searchName">Search Name</Label>
                <Input
                  id="searchName"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  placeholder="e.g., Atlanta SFH Under 100K"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => handleSaveCurrentSearch({})}
                disabled={!newSearchName.trim()}
              >
                Save Search
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {savedSearches.map((search) => (
          <Card key={search.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <span>{search.name}</span>
                    {search.newResultsCount > 0 && (
                      <Badge variant="default" className="bg-red-500">
                        {search.newResultsCount} new
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formatCriteria(search.criteria).map((criterion, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {criterion}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAlerts(search.id)}
                    className={search.alertsEnabled ? 'text-blue-600' : 'text-gray-400'}
                  >
                    <Bell className="w-4 h-4" fill={search.alertsEnabled ? 'currentColor' : 'none'} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSearch(search)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSearch(search.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                <span>Created: {search.createdAt}</span>
                <span>Last run: {search.lastRun}</span>
              </div>

              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => onApplySearch(search.criteria)}
                  className="flex-1"
                >
                  Run Search
                </Button>
                {search.alertsEnabled && (
                  <Button variant="outline" size="sm">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Alerts On
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {savedSearches.length === 0 && (
          <Card className="text-center py-8">
            <CardContent>
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Searches</h3>
              <p className="text-gray-600 mb-4">
                Save your search criteria to quickly find similar deals and get notified of new matches.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Save Your First Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SavedSearches;
