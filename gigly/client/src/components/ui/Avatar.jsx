import React from 'react';
import { cn, getInitials } from '../../utils/helpers';

const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg', '2xl': 'w-20 h-20 text-xl' };

const Avatar = ({ src, name, size = 'md', className }) => {
  const BASE_URL = 'http://localhost:5000';
  const imgSrc = src?.startsWith('http') ? src : src ? `${BASE_URL}${src}` : null;

  return imgSrc ? (
    <img src={imgSrc} alt={name} className={cn('rounded-full object-cover flex-shrink-0', sizes[size], className)} />
  ) : (
    <div className={cn('rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center flex-shrink-0', sizes[size], className)}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
