import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton, { SkeletonCard, SkeletonTable, SkeletonFreelancerCard } from '../../components/ui/Skeleton';

describe('Skeleton component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies animate-pulse class', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild.className).toContain('animate-pulse');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-full" />);
    expect(container.firstChild.className).toContain('h-4');
  });
});

describe('SkeletonCard component', () => {
  it('renders without crashing', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders multiple skeleton elements', () => {
    const { container } = render(<SkeletonCard />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(3);
  });
});

describe('SkeletonTable component', () => {
  it('renders default 5 rows', () => {
    const { container } = render(<SkeletonTable />);
    const rows = container.querySelectorAll('.border-b');
    expect(rows.length).toBe(5);
  });

  it('renders custom number of rows', () => {
    const { container } = render(<SkeletonTable rows={3} />);
    const rows = container.querySelectorAll('.border-b');
    expect(rows.length).toBe(3);
  });
});

describe('SkeletonFreelancerCard component', () => {
  it('renders without crashing', () => {
    const { container } = render(<SkeletonFreelancerCard />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
