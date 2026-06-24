import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  timeAgo,
  getInitials,
  truncate,
  getStatusBadge,
  STATUS_MAP,
} from '../../utils/helpers';

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'skipped', 'added')).toBe('base added');
  });

  it('deduplicates tailwind conflicting classes', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });
});

describe('formatCurrency()', () => {
  it('formats a positive number as INR currency', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('1,000');
  });

  it('formats 0 as ₹0', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('handles null/undefined gracefully (defaults to 0)', () => {
    const result = formatCurrency(null);
    expect(result).toContain('0');
  });

  it('formats large numbers', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('10,00,000');
  });
});

describe('formatDate()', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2024-01-15');
    expect(result).toMatch(/Jan|2024/);
  });

  it('returns em-dash for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('returns em-dash for undefined', () => {
    expect(formatDate(undefined)).toBe('—');
  });

  it('handles Date objects', () => {
    const result = formatDate(new Date('2024-06-01'));
    expect(result).toMatch(/Jun|2024/);
  });
});

describe('timeAgo()', () => {
  it('returns empty string for null', () => {
    expect(timeAgo(null)).toBe('');
  });

  it('returns "Just now" for very recent dates (< 60 seconds)', () => {
    const now = new Date(Date.now() - 5000);
    expect(timeAgo(now)).toBe('Just now');
  });

  it('returns minutes ago for dates within the last hour', () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    expect(timeAgo(tenMinutesAgo)).toBe('10m ago');
  });

  it('returns hours ago for dates within last day', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(timeAgo(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days ago for dates within last week', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(timeAgo(twoDaysAgo)).toBe('2d ago');
  });

  it('returns formatted date for old dates (> 1 week)', () => {
    const oldDate = new Date('2020-01-01');
    const result = timeAgo(oldDate);
    expect(result).toMatch(/2020|Jan/);
  });
});

describe('getInitials()', () => {
  it('returns initials for a full name', () => {
    expect(getInitials('Manit Chabhadiya')).toBe('MC');
  });

  it('returns single initial for a single name', () => {
    expect(getInitials('Manit')).toBe('M');
  });

  it('returns "U" for null/undefined/empty', () => {
    expect(getInitials(null)).toBe('U');
    expect(getInitials('')).toBe('U');
  });

  it('returns at most 2 characters', () => {
    expect(getInitials('A B C D E').length).toBeLessThanOrEqual(2);
  });

  it('uppercases initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

describe('truncate()', () => {
  it('returns original string if shorter than limit', () => {
    expect(truncate('short', 80)).toBe('short');
  });

  it('truncates and appends ellipsis for long strings', () => {
    const long = 'a'.repeat(100);
    const result = truncate(long, 80);
    expect(result.length).toBe(83); // 80 + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  it('uses default limit of 80', () => {
    const long = 'a'.repeat(100);
    const result = truncate(long);
    expect(result.length).toBe(83);
  });

  it('returns null/undefined unchanged', () => {
    expect(truncate(null)).toBeNull();
    expect(truncate(undefined)).toBeUndefined();
  });

  it('returns string unchanged if exactly at limit', () => {
    const str = 'a'.repeat(80);
    expect(truncate(str, 80)).toBe(str);
  });
});

describe('getStatusBadge()', () => {
  it('returns correct label and class for known statuses', () => {
    expect(getStatusBadge('active')).toEqual({ label: 'Active', class: 'badge-green' });
    expect(getStatusBadge('pending')).toEqual({ label: 'Pending', class: 'badge-yellow' });
    expect(getStatusBadge('completed')).toEqual({ label: 'Completed', class: 'badge-blue' });
  });

  it('returns gray badge for unknown status', () => {
    const result = getStatusBadge('some_unknown_status');
    expect(result.class).toBe('badge-gray');
    expect(result.label).toBe('some_unknown_status');
  });

  it('all STATUS_MAP values have label and class', () => {
    Object.values(STATUS_MAP).forEach((entry) => {
      expect(entry).toHaveProperty('label');
      expect(entry).toHaveProperty('class');
    });
  });
});
