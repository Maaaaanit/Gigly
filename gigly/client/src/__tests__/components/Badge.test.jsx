import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../../components/ui/Badge';

describe('Badge component', () => {
  it('renders with status prop and shows correct label', () => {
    render(<Badge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders children when no status prop', () => {
    render(<Badge>Custom Text</Badge>);
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
  });

  it('applies green badge class for active status', () => {
    const { container } = render(<Badge status="active" />);
    expect(container.firstChild.className).toContain('badge-green');
  });

  it('applies yellow badge class for pending status', () => {
    const { container } = render(<Badge status="pending" />);
    expect(container.firstChild.className).toContain('badge-yellow');
  });

  it('applies red badge class for rejected status', () => {
    const { container } = render(<Badge status="rejected" />);
    expect(container.firstChild.className).toContain('badge-red');
  });

  it('applies gray badge class for unknown status', () => {
    const { container } = render(<Badge status="unknown_status" />);
    expect(container.firstChild.className).toContain('badge-gray');
  });

  it('renders children text even when status is provided', () => {
    render(<Badge status="active">Override</Badge>);
    expect(screen.getByText('Override')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Badge status="active" className="extra-class" />);
    expect(container.firstChild.className).toContain('extra-class');
  });

  it('always renders a span element', () => {
    const { container } = render(<Badge status="active" />);
    expect(container.firstChild.tagName).toBe('SPAN');
  });
});
