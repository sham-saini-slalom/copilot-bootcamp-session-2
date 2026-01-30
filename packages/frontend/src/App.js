import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import theme from './theme/theme';
import { MAX_TASK_TITLE_LENGTH } from './utils/constants';
import { formatDate, getDueDateColor, formatRelativeDate } from './utils/dateHelpers';
import TaskEditDialog from './components/TaskEditDialog';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editDialog, setEditDialog] = useState({ open: false, task: null });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setTasks(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks: ' + err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) {
      showSnackbar('Task title cannot be empty', 'error');
      return;
    }

    if (newTask.length > MAX_TASK_TITLE_LENGTH) {
      showSnackbar(`Task title must be ${MAX_TASK_TITLE_LENGTH} characters or less`, 'error');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTask }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add task');
      }

      const result = await response.json();
      setTasks([result, ...tasks]);
      setNewTask('');
      showSnackbar('Task added successfully');
    } catch (err) {
      showSnackbar('Error adding task: ' + err.message, 'error');
      console.error('Error adding task:', err);
    }
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      showSnackbar('Task updated');
    } catch (err) {
      showSnackbar('Error updating task: ' + err.message, 'error');
      console.error('Error updating task:', err);
    }
  };

  const handleOpenEdit = (task) => {
    setEditDialog({ open: true, task });
  };

  const handleCloseEdit = () => {
    setEditDialog({ open: false, task: null });
  };

  const handleSaveEdit = async (updatedTask) => {
    try {
      const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: updatedTask.title,
          dueDate: updatedTask.dueDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      const result = await response.json();
      setTasks(tasks.map(task => task.id === updatedTask.id ? result : task));
      showSnackbar('Task updated successfully');
      handleCloseEdit();
    } catch (err) {
      showSnackbar('Error updating task: ' + err.message, 'error');
      console.error('Error updating task:', err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== taskId));
      showSnackbar('Task deleted');
    } catch (err) {
      showSnackbar('Error deleting task: ' + err.message, 'error');
      console.error('Error deleting task:', err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Todo App
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Keep track of your tasks
            </Typography>
          </Box>

          {/* Add Task Form */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Add New Task
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter task title"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  error={newTask.length > MAX_TASK_TITLE_LENGTH}
                  helperText={newTask.length > MAX_TASK_TITLE_LENGTH ? `Maximum ${MAX_TASK_TITLE_LENGTH} characters` : ''}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 120 }}
                  disabled={!newTask.trim() || newTask.length > MAX_TASK_TITLE_LENGTH}
                >
                  Add Task
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Task List */}
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              Tasks
            </Typography>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!loading && !error && tasks.length === 0 && (
              <Card>
                <CardContent>
                  <Typography variant="body1" color="text.secondary" align="center">
                    No tasks yet. Add your first task above!
                  </Typography>
                </CardContent>
              </Card>
            )}

            {!loading && !error && tasks.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Checkbox
                        checked={Boolean(task.completed)}
                        onChange={() => handleToggleComplete(task.id, task.completed)}
                        color="success"
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {task.title}
                        </Typography>
                        {task.due_date && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <EventIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(task.due_date)}
                            </Typography>
                            <Chip
                              label={formatRelativeDate(task.due_date)}
                              size="small"
                              color={getDueDateColor(task.due_date, task.completed)}
                              sx={{ height: 20 }}
                            />
                          </Box>
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        color="primary"
                        aria-label="edit task"
                        onClick={() => handleOpenEdit(task)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(task.id)}
                        aria-label="delete task"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>

          {/* Edit Task Dialog */}
          <TaskEditDialog
            open={editDialog.open}
            task={editDialog.task}
            onClose={handleCloseEdit}
            onSave={handleSaveEdit}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;