import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/helpers';

const StarRating = ({ rating = 0, max = 5, size = 14, interactive = false, onChange, className }) => (
  <div className={cn('flex items-center gap-0.5', className)}>
    {[...Array(max)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={cn('transition-colors', i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300', interactive && 'cursor-pointer hover:text-yellow-400')}
        onClick={() => interactive && onChange?.(i + 1)}
      />
    ))}
  </div>
);

export default StarRating;
