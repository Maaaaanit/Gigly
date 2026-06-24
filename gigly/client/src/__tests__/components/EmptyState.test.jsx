import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '../../components/ui/EmptyState';
import { Search } from 'lucide-react';

describe('EmptyState component', () => {
  it('renders with default title', () => {
    render(<EmptyState />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<EmptyState title="No results found" />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState description="Try adjusting your filters" />);
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<EmptyState />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders action element when provided', () => {
    render(<EmptyState action={<button>Post a Job</button>} />);
    expect(screen.getByRole('button', { name: 'Post a Job' })).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    const { container } = render(<EmptyState icon={Search} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls action onClick when action button clicked', async () => {
    const handleClick = vi.fn();
    render(<EmptyState action={<button onClick={handleClick}>Click Me</button>} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
