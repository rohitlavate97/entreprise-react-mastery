import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Bug1StateMutation } from '../components/Bug1StateMutation';
import { Bug3IndexKey } from '../components/Bug3IndexKey';

describe('Project 1: React Foundations Tests', () => {
  it('renders Bug1StateMutation and handles task addition in fixed mode', async () => {
    const user = userEvent.setup();
    render(<Bug1StateMutation />);

    // Toggle to Fix mode
    const modeBtn = screen.getByRole('button', { name: /Bug Active/i });
    await user.click(modeBtn);
    expect(screen.getByText(/Fix Active/i)).toBeInTheDocument();

    // Add new task
    const input = screen.getByPlaceholderText(/Add new task/i);
    const addBtn = screen.getByRole('button', { name: /Add Task/i });

    await user.type(input, 'Write automated regression test');
    await user.click(addBtn);

    expect(screen.getByText('Write automated regression test')).toBeInTheDocument();
  });

  it('renders Bug3IndexKey and verifies delete contact action', async () => {
    const user = userEvent.setup();
    render(<Bug3IndexKey />);

    expect(screen.getByText('Alice Enterprise')).toBeInTheDocument();
    const deleteBtn = screen.getByRole('button', { name: /Delete Top Contact/i });

    await user.click(deleteBtn);
    expect(screen.queryByText('Alice Enterprise')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Architect')).toBeInTheDocument();
  });
});
