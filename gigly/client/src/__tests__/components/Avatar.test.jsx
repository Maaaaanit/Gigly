import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from '../../components/ui/Avatar';

describe('Avatar component', () => {
  it('renders initials when no src is provided', () => {
    render(<Avatar name="Manit Chabhadiya" />);
    expect(screen.getByText('MC')).toBeInTheDocument();
  });

  it('renders "U" for null name with no src', () => {
    render(<Avatar name={null} />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('renders img when src starts with http', () => {
    render(<Avatar src="http://example.com/avatar.jpg" name="Test User" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('http://example.com/avatar.jpg');
  });

  it('prepends base URL when src is a relative path', () => {
    render(<Avatar src="/uploads/avatar.jpg" name="Test User" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('http://localhost:5000/uploads/avatar.jpg');
  });

  it('shows initials div when src is null', () => {
    const { container } = render(<Avatar src={null} name="Jane Doe" />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('applies md size class by default', () => {
    const { container } = render(<Avatar name="Test" />);
    expect(container.firstChild.className).toContain('w-10');
  });

  it('applies sm size class when size="sm"', () => {
    const { container } = render(<Avatar name="Test" size="sm" />);
    expect(container.firstChild.className).toContain('w-8');
  });

  it('applies xl size class when size="xl"', () => {
    const { container } = render(<Avatar name="Test" size="xl" />);
    expect(container.firstChild.className).toContain('w-16');
  });

  it('applies custom className', () => {
    const { container } = render(<Avatar name="Test" className="border-2" />);
    expect(container.firstChild.className).toContain('border-2');
  });

  it('sets alt attribute on img', () => {
    render(<Avatar src="http://example.com/img.jpg" name="Jane" />);
    expect(screen.getByRole('img').getAttribute('alt')).toBe('Jane');
  });
});
