import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Merge, 
  Eye, 
  X, 
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search
} from 'lucide-react';
import { useBatchDuplicateDetection } from '@/hooks/useDuplicateDetection';
import { BuyerRecord } from '@/utils/deduplication';
import MergeBuyersDialog from './MergeBuyersDialog';
import { useToast } from '@/hooks/use-toast';

interface DuplicateDetectionProps {
  onRefresh?: () => void;
}

const DuplicateDetection: React.FC<DuplicateDetectionProps> = ({ onRefresh }) => {
  const { toast } = useToast();
  const { duplicateGroups, isLoading, refetch } = useBatchDuplicateDetection();
  const [selectedGroup, setSelectedGroup] = useState<{ primary: BuyerRecord; duplicates: BuyerRecord[] } | null>(null);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [selectedPrimary, setSelectedPrimary] = useState<BuyerRecord | null>(null);
  const [selectedSecondary, setSelectedSecondary] = useState<BuyerRecord | null>(null);

  const handleMerge = (primary: BuyerRecord, secondary: BuyerRecord) => {
    setSelectedPrimary(primary);
    setSelectedSecondary(secondary);
    setMergeDialogOpen(true);
  };

  const handleMergeComplete = () => {
    refetch();
    onRefresh?.();
    toast({
      title: "Merge Complete",
      description: "The duplicate buyers have been successfully merged.",
    });
  };

  const formatBuyerInfo = (buyer: BuyerRecord) => {
    const info = [];
    if (buyer.email) info.push(buyer.email);
    if (buyer.phone) info.push(buyer.phone);
    if (buyer.city && buyer.state) info.push(`${buyer.city}, ${buyer.state}`);
    return info.join(' • ');
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Duplicate Detection</h2>
          {duplicateGroups.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {duplicateGroups.reduce((acc, group) => acc + group.duplicates.length, 0)} duplicates found
            </Badge>
          )}
        </div>
        <Button onClick={() => refetch()} disabled={isLoading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Scanning...' : 'Scan for Duplicates'}
        </Button>
      </div>

      {/* Status Alert */}
      {!isLoading && duplicateGroups.length === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            No duplicate buyers detected. Your CRM is clean! 🎉
          </AlertDescription>
        </Alert>
      )}

      {duplicateGroups.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Found {duplicateGroups.length} groups of potential duplicates. 
            Review and merge them to keep your CRM organized.
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicate Groups */}
      {duplicateGroups.length > 0 && (
        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {duplicateGroups.map((group, groupIndex) => (
              <Card key={groupIndex} className="border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Duplicate Group {groupIndex + 1}
                    <Badge variant="outline">{group.duplicates.length + 1} records</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Primary Buyer */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default">Primary</Badge>
                          <h4 className="font-medium">{group.primary.name || 'Unnamed Buyer'}</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {formatBuyerInfo(group.primary)}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created {getDaysAgo(group.primary.created_at!)} days ago
                          </span>
                          <span>ID: {group.primary.id.slice(-8)}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedGroup(group)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Duplicate Buyers */}
                  <div className="space-y-3">
                    {group.duplicates.map((duplicate, dupIndex) => (
                      <div key={duplicate.id} className="border-l-4 border-red-500 pl-4 bg-red-50 dark:bg-red-900/10 p-3 rounded-r">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="destructive">Duplicate</Badge>
                              <h4 className="font-medium">{duplicate.name || 'Unnamed Buyer'}</h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {formatBuyerInfo(duplicate)}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Created {getDaysAgo(duplicate.created_at!)} days ago
                              </span>
                              <span>ID: {duplicate.id.slice(-8)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleMerge(group.primary, duplicate)}
                            >
                              <Merge className="w-4 h-4 mr-2" />
                              Merge
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="grid" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {duplicateGroups.map((group, groupIndex) => (
                <Card key={groupIndex} className="border-orange-200 dark:border-orange-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Group {groupIndex + 1}
                      <Badge variant="outline" className="text-xs">{group.duplicates.length + 1}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Primary */}
                    <div className="p-3 border border-blue-200 dark:border-blue-800 rounded bg-blue-50 dark:bg-blue-900/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" className="text-xs">Primary</Badge>
                        <span className="font-medium text-sm">{group.primary.name || 'Unnamed'}</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {group.primary.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {group.primary.email}
                          </div>
                        )}
                        {group.primary.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {group.primary.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Duplicates */}
                    {group.duplicates.slice(0, 2).map((duplicate) => (
                      <div key={duplicate.id} className="p-3 border border-red-200 dark:border-red-800 rounded bg-red-50 dark:bg-red-900/10">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="text-xs">Duplicate</Badge>
                            <span className="font-medium text-sm">{duplicate.name || 'Unnamed'}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleMerge(group.primary, duplicate)}
                          >
                            <Merge className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {duplicate.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {duplicate.email}
                            </div>
                          )}
                          {duplicate.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {duplicate.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {group.duplicates.length > 2 && (
                      <div className="text-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedGroup(group)}
                        >
                          View {group.duplicates.length - 2} more
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Merge Dialog */}
      {selectedPrimary && selectedSecondary && (
        <MergeBuyersDialog
          open={mergeDialogOpen}
          onOpenChange={setMergeDialogOpen}
          primaryBuyer={selectedPrimary}
          secondaryBuyer={selectedSecondary}
          onMergeComplete={handleMergeComplete}
        />
      )}
    </div>
  );
};

export default DuplicateDetection;