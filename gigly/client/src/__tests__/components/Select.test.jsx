import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from '../../components/ui/Select';

describe('Select component', () => {
  it('renders without crashing', () => {
    render(<Select><option value="a">Option A</option></Select>);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select label="Category"><option value="a">A</option></Select>);
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('renders error message when error prop provided', () => {
    render(<Select error="Please select an option"><option value="">Select</option></Select>);
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('applies error border class when error is set', () => {
    render(<Select error="Error"><option value="">Option</option></Select>);
    const select = screen.getByRole('combobox');
    expect(select.className).toContain('border-red-400');
  });

  it('renders children options', () => {
    render(
      <Select>
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </Select>
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', async () => {
    const handleChange = vi.fn();
    render(
      <Select onChange={handleChange}>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>
    );
    await userEvent.selectOptions(screen.getByRole('combobox'), 'b');
    expect(handleChange).toHaveBeenCalled();
  });
});
