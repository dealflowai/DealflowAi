
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200">
    <div className="flex items-center justify-between mb-3">
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="w-10 h-10 rounded-lg" />
    </div>
    <Skeleton className="h-3 w-20" />
  </div>
);

export const SkeletonTable = () => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  </div>
);
