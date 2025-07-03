
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';

interface AddBuyerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuyerAdded: () => void;
}

const AddBuyerDialog = ({ open, onOpenChange, onBuyerAdded }: AddBuyerDialogProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budget_min: '',
    budget_max: '',
    status: 'new',
    source: '',
  });

  const [markets, setMarkets] = useState<string[]>([]);
  const [assetTypes, setAssetTypes] = useState<string[]>([]);
  const [newMarket, setNewMarket] = useState('');
  const [newAssetType, setNewAssetType] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('buyers')
        .insert({
          owner_id: user.id,
          name: formData.name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
          status: formData.status,
          source: formData.source || null,
          markets: markets.length > 0 ? markets : null,
          asset_types: assetTypes.length > 0 ? assetTypes : null,
        });

      if (error) {
        console.error('Error adding buyer:', error);
        toast({
          title: 'Error',
          description: 'Failed to add buyer. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Buyer added successfully!',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        budget_min: '',
        budget_max: '',
        status: 'new',
        source: '',
      });
      setMarkets([]);
      setAssetTypes([]);
      setNewMarket('');
      setNewAssetType('');

      onBuyerAdded();
    } catch (error) {
      console.error('Error adding buyer:', error);
      toast({
        title: 'Error',
        description: 'Failed to add buyer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMarket = () => {
    if (newMarket.trim() && !markets.includes(newMarket.trim())) {
      setMarkets([...markets, newMarket.trim()]);
      setNewMarket('');
    }
  };

  const removeMarket = (market: string) => {
    setMarkets(markets.filter(m => m !== market));
  };

  const addAssetType = () => {
    if (newAssetType.trim() && !assetTypes.includes(newAssetType.trim())) {
      setAssetTypes([...assetTypes, newAssetType.trim()]);
      setNewAssetType('');
    }
  };

  const removeAssetType = (type: string) => {
    setAssetTypes(assetTypes.filter(t => t !== type));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Buyer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter buyer's name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </div>

            <div>
              <Label htmlFor="budget_min">Budget Min ($)</Label>
              <Input
                id="budget_min"
                type="number"
                value={formData.budget_min}
                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                placeholder="Minimum budget"
              />
            </div>

            <div>
              <Label htmlFor="budget_max">Budget Max ($)</Label>
              <Input
                id="budget_max"
                type="number"
                value={formData.budget_max}
                onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                placeholder="Maximum budget"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="How did you find this buyer?"
            />
          </div>

          <div>
            <Label>Markets</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {markets.map((market) => (
                <Badge key={market} variant="secondary" className="flex items-center gap-1">
                  {market}
                  <button
                    type="button"
                    onClick={() => removeMarket(market)}
                    className="hover:bg-gray-200 rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newMarket}
                onChange={(e) => setNewMarket(e.target.value)}
                placeholder="Add market (e.g., Los Angeles, CA)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMarket())}
              />
              <Button type="button" onClick={addMarket} variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Asset Types</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {assetTypes.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type}
                  <button
                    type="button"
                    onClick={() => removeAssetType(type)}
                    className="hover:bg-gray-200 rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newAssetType}
                onChange={(e) => setNewAssetType(e.target.value)}
                placeholder="Add asset type (e.g., SFH, Land, Multifamily)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAssetType())}
              />
              <Button type="button" onClick={addAssetType} variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Buyer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBuyerDialog;
