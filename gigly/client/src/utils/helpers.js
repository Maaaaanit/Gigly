import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export const formatDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
};

export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncate = (str, len = 80) => (!str || str.length <= len) ? str : str.slice(0, len) + '...';

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  window.URL.revokeObjectURL(url);
};

export const STATUS_MAP = {
  active: { label: 'Active', class: 'badge-green' },
  pending: { label: 'Pending', class: 'badge-yellow' },
  completed: { label: 'Completed', class: 'badge-blue' },
  cancelled: { label: 'Cancelled', class: 'badge-red' },
  disputed: { label: 'Disputed', class: 'badge-red' },
  under_review: { label: 'Under Review', class: 'badge-yellow' },
  open: { label: 'Open', class: 'badge-green' },
  in_progress: { label: 'In Progress', class: 'badge-blue' },
  closed: { label: 'Closed', class: 'badge-gray' },
  submitted: { label: 'Submitted', class: 'badge-blue' },
  approved: { label: 'Approved', class: 'badge-green' },
  rejected: { label: 'Rejected', class: 'badge-red' },
  paid: { label: 'Paid', class: 'badge-green' },
  sent: { label: 'Sent', class: 'badge-blue' },
  draft: { label: 'Draft', class: 'badge-gray' },
  withdrawn: { label: 'Withdrawn', class: 'badge-gray' },
  accepted: { label: 'Accepted', class: 'badge-green' },
  available: { label: 'Available', class: 'badge-green' },
  busy: { label: 'Busy', class: 'badge-yellow' },
  unavailable: { label: 'Unavailable', class: 'badge-red' },
  entry: { label: 'Entry Level', class: 'badge-gray' },
  intermediate: { label: 'Intermediate', class: 'badge-blue' },
  expert: { label: 'Expert', class: 'badge-purple' },
};

export const getStatusBadge = (status) => STATUS_MAP[status] || { label: status, class: 'badge-gray' };
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CATEGORIES = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design', 'Content Writing', 'Digital Marketing', 'Data Science', 'DevOps', 'Video Editing', 'Photography', 'Translation', 'Virtual Assistant', 'Accounting', 'Legal', 'Other'];
