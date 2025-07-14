import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { findDuplicates, BuyerRecord, DeduplicationResult } from '@/utils/deduplication';

export interface UseDuplicateDetectionProps {
  newBuyer?: Partial<BuyerRecord>;
  enabled?: boolean;
}

export function useDuplicateDetection({ newBuyer, enabled = true }: UseDuplicateDetectionProps) {
  const { user } = useUser();
  const [ignoredDuplicates, setIgnoredDuplicates] = useState<Set<string>>(new Set());

  // Fetch all existing buyers for comparison
  const { data: existingBuyers = [], isLoading } = useQuery({
    queryKey: ['buyers-for-deduplication', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get the profile to get the proper UUID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching buyers for deduplication:', error);
        return [];
      }
      
      return data as BuyerRecord[];
    },
    enabled: enabled && !!user?.id,
  });

  // Calculate duplicate matches
  const duplicateResult: DeduplicationResult | null = useMemo(() => {
    if (!newBuyer || !existingBuyers.length || isLoading) {
      return null;
    }

    const result = findDuplicates(newBuyer, existingBuyers);
    
    // Filter out ignored duplicates
    const filteredMatches = result.matches.filter(
      match => !ignoredDuplicates.has(match.buyer.id)
    );

    return {
      ...result,
      matches: filteredMatches,
      bestMatch: filteredMatches.length > 0 ? filteredMatches[0] : undefined,
      isDuplicate: filteredMatches.length > 0 && filteredMatches[0].matchScore >= 70
    };
  }, [newBuyer, existingBuyers, isLoading, ignoredDuplicates]);

  // Mark a buyer as not a duplicate (ignore it)
  const ignoreDuplicate = (buyerId: string) => {
    setIgnoredDuplicates(prev => new Set([...prev, buyerId]));
  };

  // Reset ignored duplicates
  const resetIgnored = () => {
    setIgnoredDuplicates(new Set());
  };

  // Check if we have any high-confidence duplicates
  const hasHighConfidenceDuplicates = duplicateResult?.matches.some(
    match => match.confidence === 'high'
  ) || false;

  // Check if we should warn the user
  const shouldWarn = duplicateResult?.matches.length > 0 || false;

  return {
    duplicateResult,
    isLoading,
    hasHighConfidenceDuplicates,
    shouldWarn,
    ignoreDuplicate,
    resetIgnored,
    ignoredDuplicates: Array.from(ignoredDuplicates)
  };
}

// Hook for batch duplicate detection across all buyers
export function useBatchDuplicateDetection() {
  const { user } = useUser();

  const { data: duplicateGroups = [], isLoading, refetch } = useQuery({
    queryKey: ['batch-duplicate-detection', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get the profile to get the proper UUID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      
      if (!profile?.id) return [];
      
      const { data: buyers, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching buyers for batch deduplication:', error);
        return [];
      }

      // Find all duplicate groups
      const duplicateGroups: { primary: BuyerRecord; duplicates: BuyerRecord[] }[] = [];
      const processedIds = new Set<string>();

      for (const buyer of buyers) {
        if (processedIds.has(buyer.id)) continue;

        const otherBuyers = buyers.filter(b => b.id !== buyer.id && !processedIds.has(b.id));
        const result = findDuplicates(buyer, otherBuyers);
        
        const highConfidenceMatches = result.matches.filter(
          match => match.confidence === 'high' || match.matchScore >= 70
        );

        if (highConfidenceMatches.length > 0) {
          duplicateGroups.push({
            primary: buyer,
            duplicates: highConfidenceMatches.map(match => match.buyer)
          });

          // Mark all as processed
          processedIds.add(buyer.id);
          highConfidenceMatches.forEach(match => processedIds.add(match.buyer.id));
        }
      }

      return duplicateGroups;
    },
    enabled: !!user?.id,
  });

  return {
    duplicateGroups,
    isLoading,
    refetch
  };
}