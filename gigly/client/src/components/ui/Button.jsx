import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  ghost: 'text-gray-600 hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
  outline: 'border border-primary-300 text-primary-700 hover:bg-primary-50',
};

const sizes = { xs: 'px-2.5 py-1.5 text-xs', sm: 'px-3 py-2 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };

const Button = React.forwardRef(({ children, variant = 'primary', size = 'md', loading, className, disabled, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={cn('inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
    {...props}
  >
    {loading && <Loader2 size={14} className="animate-spin" />}
    {children}
  </button>
));

Button.displayName = 'Button';
export default Button;
