import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MAX_TASK_TITLE_LENGTH } from '../utils/constants';

/**
 * Dialog component for editing task details
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Object} props.task - The task to edit
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {Function} props.onSave - Callback when task is saved
 */
function TaskEditDialog({ open, task, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDueDate(task.due_date ? new Date(task.due_date) : null);
      setError('');
    }
  }, [task]);

  const handleSave = () => {
    // Validate title
    if (!title.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    if (title.length > MAX_TASK_TITLE_LENGTH) {
      setError(`Task title must be ${MAX_TASK_TITLE_LENGTH} characters or less`);
      return;
    }

    // Call onSave with updated task data
    onSave({
      ...task,
      title: title.trim(),
      dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
    });

    // Reset and close
    setError('');
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            autoFocus
            label="Task Title"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            error={Boolean(error)}
            helperText={error || `${title.length}/${MAX_TASK_TITLE_LENGTH} characters`}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={(newDate) => setDueDate(newDate)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                },
                actionBar: {
                  actions: ['clear', 'today'],
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={!title.trim() || title.length > MAX_TASK_TITLE_LENGTH}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskEditDialog;
