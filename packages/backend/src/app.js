const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    due_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialTasks = [
  { title: 'Complete project documentation', completed: 0 },
  { title: 'Review pull requests', completed: 0 },
  { title: 'Setup development environment', completed: 1 }
];
const insertStmt = db.prepare('INSERT INTO tasks (title, completed) VALUES (?, ?)');

initialTasks.forEach(task => {
  insertStmt.run(task.title, task.completed);
});

console.log('In-memory database initialized with sample data');

// API Routes
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const { title, dueDate } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Task title must be 200 characters or less' });
    }

    const stmt = db.prepare('INSERT INTO tasks (title, completed, due_date) VALUES (?, ?, ?)');
    const result = stmt.run(title.trim(), 0, dueDate || null);
    const id = result.lastInsertRowid;

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed, dueDate } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Task title cannot be empty' });
      }
      if (title.length > 200) {
        return res.status(400).json({ error: 'Task title must be 200 characters or less' });
      }
    }

    // Validate completed if provided
    if (completed !== undefined && typeof completed !== 'boolean' && completed !== 0 && completed !== 1) {
      return res.status(400).json({ error: 'Completed must be a boolean value' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title.trim());
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed ? 1 : 0);
    }
    if (dueDate !== undefined) {
      updates.push('due_date = ?');
      values.push(dueDate || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const updateStmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
    updateStmt.run(...values);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Task deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = { app, db };