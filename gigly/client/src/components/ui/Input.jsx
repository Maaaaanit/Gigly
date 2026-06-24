import React from 'react';
import { cn } from '../../utils/helpers';

const Input = React.forwardRef(({ label, error, hint, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <input
      ref={ref}
      className={cn('input', error && 'border-red-400 focus:ring-red-400 focus:border-red-400', className)}
      {...props}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
    {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
