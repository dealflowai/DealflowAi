import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, User, Mail, Phone, MapPin, DollarSign, Calendar, FileText, Merge } from 'lucide-react';
import { BuyerRecord, mergeBuyerData } from '@/utils/deduplication';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MergeBuyersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  primaryBuyer: BuyerRecord;
  secondaryBuyer: BuyerRecord;
  onMergeComplete: () => void;
}

const MergeBuyersDialog: React.FC<MergeBuyersDialogProps> = ({
  open,
  onOpenChange,
  primaryBuyer,
  secondaryBuyer,
  onMergeComplete,
}) => {
  const { toast } = useToast();
  const [mergeChoices, setMergeChoices] = useState<Record<string, 'primary' | 'secondary' | 'both'>>({});
  const [isLoading, setIsLoading] = useState(false);

  const mergeableFields = [
    { key: 'name', label: 'Name', icon: User },
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'phone', label: 'Phone', icon: Phone },
    { key: 'company_name', label: 'Company', icon: User },
    { key: 'city', label: 'City', icon: MapPin },
    { key: 'state', label: 'State', icon: MapPin },
    { key: 'zip_code', label: 'Zip Code', icon: MapPin },
    { key: 'budget_min', label: 'Min Budget', icon: DollarSign },
    { key: 'budget_max', label: 'Max Budget', icon: DollarSign },
    { key: 'location_focus', label: 'Location Focus', icon: MapPin },
    { key: 'financing_type', label: 'Financing Type', icon: DollarSign },
    { key: 'acquisition_timeline', label: 'Timeline', icon: Calendar },
    { key: 'investment_criteria', label: 'Investment Criteria', icon: FileText },
    { key: 'notes', label: 'Notes', icon: FileText },
  ];

  const arrayFields = ['asset_types', 'markets', 'property_type_interest', 'tags'];

  const handleMergeChoiceChange = (field: string, choice: 'primary' | 'secondary' | 'both') => {
    setMergeChoices(prev => ({ ...prev, [field]: choice }));
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not provided';
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'Not provided';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  const getFieldChoice = (field: string): 'primary' | 'secondary' | 'both' => {
    if (mergeChoices[field]) return mergeChoices[field];
    
    // Default logic: use primary if it has value, otherwise secondary
    const primaryValue = primaryBuyer[field];
    const secondaryValue = secondaryBuyer[field];
    
    if (primaryValue && !secondaryValue) return 'primary';
    if (!primaryValue && secondaryValue) return 'secondary';
    if (primaryValue && secondaryValue) return 'primary'; // Default to primary if both have values
    return 'primary';
  };

  const handleMerge = async () => {
    setIsLoading(true);
    try {
      // Merge the data
      const mergedData = mergeBuyerData(primaryBuyer, secondaryBuyer, mergeChoices);

      // Update the primary buyer with merged data
      const { error: updateError } = await supabase
        .from('buyers')
        .update(mergedData)
        .eq('id', primaryBuyer.id);

      if (updateError) throw updateError;

      // Delete the secondary buyer
      const { error: deleteError } = await supabase
        .from('buyers')
        .delete()
        .eq('id', secondaryBuyer.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Buyers Merged Successfully",
        description: `${secondaryBuyer.name || 'Buyer'} has been merged into ${primaryBuyer.name || 'the primary buyer'}.`,
      });

      onMergeComplete();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Merge Failed",
        description: error.message || "Failed to merge buyers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const previewMergedData = () => {
    return mergeBuyerData(primaryBuyer, secondaryBuyer, mergeChoices);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="w-5 h-5" />
            Merge Duplicate Buyers
          </DialogTitle>
          <DialogDescription>
            Choose which information to keep when merging these duplicate buyer records.
            The record on the left will be kept as the primary record.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="merge" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="merge">Merge Data</TabsTrigger>
            <TabsTrigger value="preview">Preview Result</TabsTrigger>
          </TabsList>

          <TabsContent value="merge" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Badge variant="default">Primary</Badge>
                    {primaryBuyer.name || 'Unnamed Buyer'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-400">
                  <p>{primaryBuyer.email}</p>
                  <p className="text-xs">Created: {new Date(primaryBuyer.created_at!).toLocaleDateString()}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Badge variant="secondary">Secondary</Badge>
                    {secondaryBuyer.name || 'Unnamed Buyer'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-400">
                  <p>{secondaryBuyer.email}</p>
                  <p className="text-xs">Created: {new Date(secondaryBuyer.created_at!).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="space-y-6">
              {mergeableFields.map((field) => {
                const Icon = field.icon;
                const primaryValue = primaryBuyer[field.key];
                const secondaryValue = secondaryBuyer[field.key];
                
                // Skip if both values are empty
                if (!primaryValue && !secondaryValue) return null;

                return (
                  <div key={field.key} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <h4 className="font-medium">{field.label}</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Primary</p>
                        <p className="text-sm">{formatValue(primaryValue)}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Secondary</p>
                        <p className="text-sm">{formatValue(secondaryValue)}</p>
                      </div>
                    </div>

                    <RadioGroup
                      value={getFieldChoice(field.key)}
                      onValueChange={(value) => handleMergeChoiceChange(field.key, value as any)}
                      className="flex flex-wrap gap-4"
                    >
                      {primaryValue && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="primary" id={`${field.key}-primary`} />
                          <Label htmlFor={`${field.key}-primary`}>Use Primary</Label>
                        </div>
                      )}
                      {secondaryValue && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="secondary" id={`${field.key}-secondary`} />
                          <Label htmlFor={`${field.key}-secondary`}>Use Secondary</Label>
                        </div>
                      )}
                      {primaryValue && secondaryValue && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id={`${field.key}-both`} />
                          <Label htmlFor={`${field.key}-both`}>Combine Both</Label>
                        </div>
                      )}
                    </RadioGroup>
                  </div>
                );
              })}

              {/* Array fields */}
              {arrayFields.map((field) => {
                const primaryValue = primaryBuyer[field] as string[] | undefined;
                const secondaryValue = secondaryBuyer[field] as string[] | undefined;
                
                if (!primaryValue?.length && !secondaryValue?.length) return null;

                return (
                  <div key={field} className="space-y-3">
                    <h4 className="font-medium capitalize">{field.replace('_', ' ')}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Primary</p>
                        <div className="flex flex-wrap gap-1">
                          {primaryValue?.map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          )) || <span className="text-sm text-gray-400">None</span>}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Secondary</p>
                        <div className="flex flex-wrap gap-1">
                          {secondaryValue?.map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          )) || <span className="text-sm text-gray-400">None</span>}
                        </div>
                      </div>
                    </div>

                    <RadioGroup
                      value={getFieldChoice(field)}
                      onValueChange={(value) => handleMergeChoiceChange(field, value as any)}
                      className="flex flex-wrap gap-4"
                    >
                      {primaryValue?.length && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="primary" id={`${field}-primary`} />
                          <Label htmlFor={`${field}-primary`}>Use Primary</Label>
                        </div>
                      )}
                      {secondaryValue?.length && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="secondary" id={`${field}-secondary`} />
                          <Label htmlFor={`${field}-secondary`}>Use Secondary</Label>
                        </div>
                      )}
                      {primaryValue?.length && secondaryValue?.length && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id={`${field}-both`} />
                          <Label htmlFor={`${field}-both`}>Combine Both</Label>
                        </div>
                      )}
                    </RadioGroup>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Merged Result Preview</CardTitle>
                <CardDescription>
                  This is how the buyer record will look after merging.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const preview = previewMergedData();
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mergeableFields.map((field) => {
                        const value = preview[field.key];
                        if (!value) return null;

                        const Icon = field.icon;
                        return (
                          <div key={field.key} className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">{field.label}</p>
                              <p className="text-sm">{formatValue(value)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">This action cannot be undone</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleMerge} disabled={isLoading}>
              {isLoading ? 'Merging...' : 'Merge Buyers'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MergeBuyersDialog;