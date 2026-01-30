import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskEditDialog from '../TaskEditDialog';

describe('TaskEditDialog', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    completed: false,
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <TaskEditDialog
        open={true}
        task={mockTask}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    render(
      <TaskEditDialog
        open={false}
        task={mockTask}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
  });

  it('should update title input when typing', () => {
    render(
      <TaskEditDialog
        open={true}
        task={mockTask}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByLabelText('Task Title');
    fireEvent.change(input, { target: { value: 'Updated Task' } });

    expect(input.value).toBe('Updated Task');
  });

  it('should call onSave with updated task when save button is clicked', async () => {
    render(
      <TaskEditDialog
        open={true}
        task={mockTask}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByLabelText('Task Title');
    fireEvent.change(input, { target: { value: 'Updated Task Title' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockTask,
        title: 'Updated Task Title',
      });
    });
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <TaskEditDialog
        open={true}
        task={mockTask}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should show error when title is empty', () => {
    render(
      <TaskEditDialog
        open={true}
        task={mockTask}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByLabelText('Task Title');
    fireEvent.change(input, { target: { value: '' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(screen.getByText('Task title cannot be empty')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should show error when title exceeds max length', () => {
    const longTitle = 'a'.repeat(201);

    render(
      <TaskEditDialog
        open={true}
        task={mockTask}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByLabelText('Task Title');
    fireEvent.change(input, { target: { value: longTitle } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(screen.getByText('Task title must be 200 characters or less')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should disable save button when title is empty', () => {
    render(
      <TaskEditDialog
        open={true}
        task={mockTask}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByLabelText('Task Title');
    fireEvent.change(input, { target: { value: '' } });

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('should disable save button when title exceeds max length', () => {
    const longTitle = 'a'.repeat(201);

    render(
      <TaskEditDialog
        open={true}
        task={mockTask}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByLabelText('Task Title');
    fireEvent.change(input, { target: { value: longTitle } });

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('should trim whitespace from title when saving', async () => {
    render(
      <TaskEditDialog
        open={true}
        task={mockTask}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByLabelText('Task Title');
    fireEvent.change(input, { target: { value: '  Trimmed Task  ' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockTask,
        title: 'Trimmed Task',
      });
    });
  });

  it('should display character count', () => {
    render(
      <TaskEditDialog
        open={true}
        task={mockTask}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('9/200 characters')).toBeInTheDocument();
  });
});
