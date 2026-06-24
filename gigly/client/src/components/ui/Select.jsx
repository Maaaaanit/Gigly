import React from 'react';
import { cn } from '../../utils/helpers';

const Select = React.forwardRef(({ label, error, children, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <select ref={ref} className={cn('input', error && 'border-red-400', className)} {...props}>
      {children}
    </select>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
));

Select.displayName = 'Select';
export default Select;
