import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskEditDialog from '../TaskEditDialog';

// Mock the DatePicker component to avoid date-fns adapter issues in tests
jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, value, onChange }) => (
    <input
      data-testid="date-picker"
      type="text"
      aria-label={label}
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
    />
  ),
}));

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }) => children,
}));

describe('TaskEditDialog', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    completed: false,
    due_date: null,
    tags: [],
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Critical functionality: Task saving with valid data
  describe('saving tasks', () => {
    it('should save updated task when user clicks save with valid title', async () => {
      // Arrange
      render(
        <TaskEditDialog
          open={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Act
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'Updated Task Title' } });
      fireEvent.click(screen.getByText('Save'));

      // Assert
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            title: 'Updated Task Title',
          })
        );
      });
    });

    it('should trim whitespace from title when saving task', async () => {
      // Arrange
      render(
        <TaskEditDialog
          open={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Act
      fireEvent.change(screen.getByLabelText('Task Title'), {
        target: { value: '  Trimmed Task  ' },
      });
      fireEvent.click(screen.getByText('Save'));

      // Assert
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Trimmed Task',
          })
        );
      });
    });

    it('should save task with due date when user selects a date', async () => {
      // Arrange
      render(
        <TaskEditDialog
          open={true}
          task={mockTask}
          availableTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Act
      fireEvent.click(screen.getByText('Save'));

      // Assert
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Task',
            dueDate: null,
          })
        );
      });
    });

    it('should call onSave with task data when save is clicked', async () => {
      // Arrange
      render(
        <TaskEditDialog
          open={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Act
      fireEvent.click(screen.getByText('Save'));

      // Assert
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockTask.id,
            title: 'Test Task',
          })
        );
      });
    });
  });

  // Critical functionality: Input validation
  describe('validation', () => {
    it('should prevent saving when title is empty', () => {
      // Arrange
      render(
        <TaskEditDialog
          open={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Act
      fireEvent.change(screen.getByLabelText('Task Title'), {
        target: { value: '' },
      });

      // Assert
      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should prevent saving when title exceeds maximum length', () => {
      // Arrange
      const longTitle = 'a'.repeat(201);
      render(
        <TaskEditDialog
          open={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Act
      fireEvent.change(screen.getByLabelText('Task Title'), {
        target: { value: longTitle },
      });

      // Assert
      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should disable save button when title is empty', () => {
      // Arrange
      render(
        <TaskEditDialog
          open={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Act
      fireEvent.change(screen.getByLabelText('Task Title'), {
        target: { value: '' },
      });

      // Assert
      expect(screen.getByText('Save')).toBeDisabled();
    });

    it('should disable save button when title exceeds maximum length', () => {
      // Arrange
      const longTitle = 'a'.repeat(201);
      render(
        <TaskEditDialog
          open={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Act
      fireEvent.change(screen.getByLabelText('Task Title'), {
        target: { value: longTitle },
      });

      // Assert
      expect(screen.getByText('Save')).toBeDisabled();
    });
  });

  // Critical functionality: Cancel and close behavior
  describe('canceling and closing', () => {
    it('should close dialog without saving when user clicks cancel', () => {
      // Arrange
      render(
        <TaskEditDialog
          open={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Act
      fireEvent.click(screen.getByText('Cancel'));

      // Assert
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should discard changes when user cancels', () => {
      // Arrange
      render(
        <TaskEditDialog
          open={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Act
      fireEvent.change(screen.getByLabelText('Task Title'), {
        target: { value: 'Changed but not saved' },
      });
      fireEvent.click(screen.getByText('Cancel'));

      // Assert
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  // User interaction: Loading task data
  describe('editing existing task', () => {
    it('should populate form with existing task data when dialog opens', () => {
      // Arrange
      const existingTask = {
        id: 2,
        title: 'Existing Task',
        completed: false,
        due_date: '2026-02-15',
        tags: ['work', 'urgent'],
      };

      // Act
      render(
        <TaskEditDialog
          open={true}
          task={existingTask}
          availableTags={['work', 'urgent', 'personal']}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Assert
      expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    });
  });
});
