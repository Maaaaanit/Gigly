import React from 'react';
import { cn, getStatusBadge } from '../../utils/helpers';

const Badge = ({ status, children, className }) => {
  const { label, class: cls } = status ? getStatusBadge(status) : { label: children, class: 'badge-gray' };
  return <span className={cn('badge', cls, className)}>{children || label}</span>;
};

export default Badge;
