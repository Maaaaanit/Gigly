import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StarRating from '../../components/ui/StarRating';

describe('StarRating component', () => {
  it('renders 5 stars by default', () => {
    const { container } = render(<StarRating rating={3} />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(5);
  });

  it('renders custom max stars', () => {
    const { container } = render(<StarRating rating={2} max={3} />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(3);
  });

  it('renders with rating 0 without crashing', () => {
    const { container } = render(<StarRating rating={0} />);
    expect(container.querySelectorAll('svg').length).toBe(5);
  });

  it('calls onChange when interactive and star is clicked', async () => {
    const onChange = vi.fn();
    const { container } = render(<StarRating rating={2} interactive onChange={onChange} />);
    const stars = container.querySelectorAll('svg');
    await userEvent.click(stars[3]);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('does not call onChange when not interactive', async () => {
    const onChange = vi.fn();
    const { container } = render(<StarRating rating={2} onChange={onChange} />);
    const stars = container.querySelectorAll('svg');
    await userEvent.click(stars[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(<StarRating rating={3} className="custom-class" />);
    expect(container.firstChild.className).toContain('custom-class');
  });

  it('renders full star (filled) for stars at or below rating', () => {
    const { container } = render(<StarRating rating={3} />);
    const stars = container.querySelectorAll('svg');
    expect(stars[0].className.baseVal).toContain('fill-yellow-400');
    expect(stars[1].className.baseVal).toContain('fill-yellow-400');
    expect(stars[2].className.baseVal).toContain('fill-yellow-400');
  });
});
