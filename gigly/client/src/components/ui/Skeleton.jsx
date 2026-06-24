import React from 'react';
import { cn } from '../../utils/helpers';

const Skeleton = ({ className }) => <div className={cn('animate-pulse bg-gray-200 rounded-lg', className)} />;

export const SkeletonCard = () => (
  <div className="card p-5 space-y-3">
    <div className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></div>
    <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" />
    <div className="flex gap-2"><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-6 w-20 rounded-full" /></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div>
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    ))}
  </div>
);

export const SkeletonFreelancerCard = () => (
  <div className="card p-5 space-y-4">
    <div className="flex items-center gap-3"><Skeleton className="w-14 h-14 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div></div>
    <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-5/6" />
    <div className="flex flex-wrap gap-2"><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="h-6 w-14 rounded-full" /></div>
    <div className="flex items-center justify-between"><Skeleton className="h-5 w-24" /><Skeleton className="h-9 w-24 rounded-lg" /></div>
  </div>
);

export default Skeleton;
