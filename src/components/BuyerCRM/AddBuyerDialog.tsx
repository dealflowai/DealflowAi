
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
    city: '',
    state: '',
    zip_code: '',
    location_focus: '',
    investment_criteria: '',
    acquisition_timeline: '',
    financing_type: '',
    land_buyer: false,
    partnership_interest: false,
    criteria_notes: '',
    portfolio_summary: '',
    equity_position: '',
    priority: 'MEDIUM',
    referral_source: '',
    notes: '',
    contact_info: '',
  });

  const [markets, setMarkets] = useState<string[]>([]);
  const [assetTypes, setAssetTypes] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [additionalTags, setAdditionalTags] = useState<string[]>([]);
  
  const [newMarket, setNewMarket] = useState('');
  const [newAssetType, setNewAssetType] = useState('');
  const [newPropertyType, setNewPropertyType] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newAdditionalTag, setNewAdditionalTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);

    try {
      // Get the profile to get the proper UUID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      
      if (!profile?.id) {
        toast({
          title: "Error",
          description: "Profile not found",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('buyers')
        .insert({
          owner_id: profile.id,
          name: formData.name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
          status: formData.status,
          source: formData.source || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zip_code || null,
          location_focus: formData.location_focus || null,
          investment_criteria: formData.investment_criteria || null,
          acquisition_timeline: formData.acquisition_timeline || null,
          financing_type: formData.financing_type || null,
          land_buyer: formData.land_buyer,
          partnership_interest: formData.partnership_interest,
          criteria_notes: formData.criteria_notes || null,
          portfolio_summary: formData.portfolio_summary || null,
          equity_position: formData.equity_position ? parseFloat(formData.equity_position) : null,
          priority: formData.priority,
          referral_source: formData.referral_source || null,
          notes: formData.notes || null,
          contact_info: formData.contact_info || null,
          markets: markets.length > 0 ? markets : null,
          asset_types: assetTypes.length > 0 ? assetTypes : null,
          property_type_interest: propertyTypes.length > 0 ? propertyTypes : null,
          tags: tags.length > 0 ? tags : null,
          tags_additional: additionalTags.length > 0 ? additionalTags : null,
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
        city: '',
        state: '',
        zip_code: '',
        location_focus: '',
        investment_criteria: '',
        acquisition_timeline: '',
        financing_type: '',
        land_buyer: false,
        partnership_interest: false,
        criteria_notes: '',
        portfolio_summary: '',
        equity_position: '',
        priority: 'MEDIUM',
        referral_source: '',
        notes: '',
        contact_info: '',
      });
      setMarkets([]);
      setAssetTypes([]);
      setPropertyTypes([]);
      setTags([]);
      setAdditionalTags([]);
      setNewMarket('');
      setNewAssetType('');
      setNewPropertyType('');
      setNewTag('');
      setNewAdditionalTag('');

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

  const addPropertyType = () => {
    if (newPropertyType.trim() && !propertyTypes.includes(newPropertyType.trim())) {
      setPropertyTypes([...propertyTypes, newPropertyType.trim()]);
      setNewPropertyType('');
    }
  };

  const removePropertyType = (type: string) => {
    setPropertyTypes(propertyTypes.filter(t => t !== type));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addAdditionalTag = () => {
    if (newAdditionalTag.trim() && !additionalTags.includes(newAdditionalTag.trim())) {
      setAdditionalTags([...additionalTags, newAdditionalTag.trim()]);
      setNewAdditionalTag('');
    }
  };

  const removeAdditionalTag = (tag: string) => {
    setAdditionalTags(additionalTags.filter(t => t !== tag));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Buyer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Buyer's full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>

              <div>
                <Label htmlFor="contact_info">Contact Info</Label>
                <Input
                  id="contact_info"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  placeholder="Additional contact details"
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
                  <option value="not contacted">Not Contacted</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="deal pending">Deal Pending</option>
                </select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="VERY HIGH">Very High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Location Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                />
              </div>

              <div>
                <Label htmlFor="zip_code">Zip Code</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  placeholder="Zip code"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="location_focus">Location Focus</Label>
                <Input
                  id="location_focus"
                  value={formData.location_focus}
                  onChange={(e) => setFormData({ ...formData, location_focus: e.target.value })}
                  placeholder="Specific areas or regions of interest"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>Target Markets</Label>
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
          </div>

          {/* Investment Criteria */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Investment Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <Label htmlFor="equity_position">Equity Position (%)</Label>
                <Input
                  id="equity_position"
                  type="number"
                  step="0.01"
                  value={formData.equity_position}
                  onChange={(e) => setFormData({ ...formData, equity_position: e.target.value })}
                  placeholder="Equity percentage"
                />
              </div>

              <div>
                <Label htmlFor="financing_type">Financing Type</Label>
                <select
                  id="financing_type"
                  value={formData.financing_type}
                  onChange={(e) => setFormData({ ...formData, financing_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select financing type</option>
                  <option value="Cash">Cash</option>
                  <option value="Conventional">Conventional</option>
                  <option value="Hard Money">Hard Money</option>
                  <option value="Private Money">Private Money</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div>
                <Label htmlFor="acquisition_timeline">Acquisition Timeline</Label>
                <select
                  id="acquisition_timeline"
                  value={formData.acquisition_timeline}
                  onChange={(e) => setFormData({ ...formData, acquisition_timeline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select timeline</option>
                  <option value="Immediate">Immediate (0-30 days)</option>
                  <option value="Short Term">Short Term (1-3 months)</option>
                  <option value="Medium Term">Medium Term (3-6 months)</option>
                  <option value="Long Term">Long Term (6+ months)</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="investment_criteria">Investment Criteria</Label>
                <Textarea
                  id="investment_criteria"
                  value={formData.investment_criteria}
                  onChange={(e) => setFormData({ ...formData, investment_criteria: e.target.value })}
                  placeholder="Detailed investment criteria and requirements"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="criteria_notes">Criteria Notes</Label>
                <Textarea
                  id="criteria_notes"
                  value={formData.criteria_notes}
                  onChange={(e) => setFormData({ ...formData, criteria_notes: e.target.value })}
                  placeholder="Additional notes about investment criteria"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Property Preferences */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Property Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="land_buyer"
                  checked={formData.land_buyer}
                  onChange={(e) => setFormData({ ...formData, land_buyer: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="land_buyer">Land Buyer</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="partnership_interest"
                  checked={formData.partnership_interest}
                  onChange={(e) => setFormData({ ...formData, partnership_interest: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="partnership_interest">Partnership Interest</Label>
              </div>
            </div>

            <div className="space-y-4">
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
                    placeholder="Add asset type (e.g., SFH, Duplex, Land)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAssetType())}
                  />
                  <Button type="button" onClick={addAssetType} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Property Types of Interest</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {propertyTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="flex items-center gap-1">
                      {type}
                      <button
                        type="button"
                        onClick={() => removePropertyType(type)}
                        className="hover:bg-gray-200 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newPropertyType}
                    onChange={(e) => setNewPropertyType(e.target.value)}
                    placeholder="Add property type (e.g., Fix & Flip, Buy & Hold)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPropertyType())}
                  />
                  <Button type="button" onClick={addPropertyType} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="referral_source">Referral Source</Label>
                <Input
                  id="referral_source"
                  value={formData.referral_source}
                  onChange={(e) => setFormData({ ...formData, referral_source: e.target.value })}
                  placeholder="Who referred this buyer?"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="portfolio_summary">Portfolio Summary</Label>
                <Textarea
                  id="portfolio_summary"
                  value={formData.portfolio_summary}
                  onChange={(e) => setFormData({ ...formData, portfolio_summary: e.target.value })}
                  placeholder="Summary of their current investment portfolio"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes and observations"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tags & Labels</h3>
            <div className="space-y-4">
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-gray-200 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Additional Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {additionalTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeAdditionalTag(tag)}
                        className="hover:bg-gray-200 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newAdditionalTag}
                    onChange={(e) => setNewAdditionalTag(e.target.value)}
                    placeholder="Add additional tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAdditionalTag())}
                  />
                  <Button type="button" onClick={addAdditionalTag} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding Buyer...' : 'Add Buyer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBuyerDialog;
