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
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS task_tags (
    task_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );
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

// Insert some initial tags
const initialTags = [
  { name: 'Work', color: '#B4A7D6' },
  { name: 'Personal', color: '#A8D8EA' },
  { name: 'Urgent', color: '#FFADAD' }
];
const insertTagStmt = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)');

initialTags.forEach(tag => {
  insertTagStmt.run(tag.name, tag.color);
});

console.log('In-memory database initialized with sample data');

// API Routes
app.get('/api/tasks', (req, res) => {
  try {
    const { tag } = req.query;
    
    let tasks;
    if (tag) {
      // Filter tasks by tag
      tasks = db.prepare(`
        SELECT DISTINCT t.* 
        FROM tasks t
        INNER JOIN task_tags tt ON t.id = tt.task_id
        WHERE tt.tag_id = ?
        ORDER BY t.created_at DESC
      `).all(tag);
    } else {
      tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    }

    // Get tags for each task
    const tasksWithTags = tasks.map(task => {
      const tags = db.prepare(`
        SELECT tg.id, tg.name, tg.color
        FROM tags tg
        INNER JOIN task_tags tt ON tg.id = tt.tag_id
        WHERE tt.task_id = ?
      `).all(task.id);
      
      return { ...task, tags };
    });

    res.json(tasksWithTags);
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

// Tag API Routes
app.get('/api/tags', (req, res) => {
  try {
    const tags = db.prepare('SELECT * FROM tags ORDER BY name').all();
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

app.post('/api/tags', (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    if (name.length > 50) {
      return res.status(400).json({ error: 'Tag name must be 50 characters or less' });
    }

    if (!color || typeof color !== 'string') {
      return res.status(400).json({ error: 'Tag color is required' });
    }

    // Check if tag already exists
    const existingTag = db.prepare('SELECT * FROM tags WHERE name = ?').get(name.trim());
    if (existingTag) {
      return res.status(409).json({ error: 'Tag with this name already exists' });
    }

    const stmt = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)');
    const result = stmt.run(name.trim(), color);
    const id = result.lastInsertRowid;

    const newTag = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
    res.status(201).json(newTag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

app.delete('/api/tags/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid tag ID is required' });
    }

    const existingTag = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
    if (!existingTag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM tags WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Tag deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Tag not found' });
    }
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

// Task-Tag Association Routes
app.post('/api/tasks/:taskId/tags', (req, res) => {
  try {
    const { taskId } = req.params;
    const { tagId } = req.body;

    if (!taskId || isNaN(parseInt(taskId))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    if (!tagId || isNaN(parseInt(tagId))) {
      return res.status(400).json({ error: 'Valid tag ID is required' });
    }

    // Check if task exists
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if tag exists
    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(tagId);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Check if association already exists
    const existing = db.prepare('SELECT * FROM task_tags WHERE task_id = ? AND tag_id = ?').get(taskId, tagId);
    if (existing) {
      return res.status(409).json({ error: 'Tag already assigned to this task' });
    }

    const stmt = db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)');
    stmt.run(taskId, tagId);

    res.status(201).json({ message: 'Tag assigned to task', taskId: parseInt(taskId), tagId: parseInt(tagId) });
  } catch (error) {
    console.error('Error assigning tag to task:', error);
    res.status(500).json({ error: 'Failed to assign tag to task' });
  }
});

app.delete('/api/tasks/:taskId/tags/:tagId', (req, res) => {
  try {
    const { taskId, tagId } = req.params;

    if (!taskId || isNaN(parseInt(taskId))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    if (!tagId || isNaN(parseInt(tagId))) {
      return res.status(400).json({ error: 'Valid tag ID is required' });
    }

    const existing = db.prepare('SELECT * FROM task_tags WHERE task_id = ? AND tag_id = ?').get(taskId, tagId);
    if (!existing) {
      return res.status(404).json({ error: 'Tag assignment not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?');
    const result = deleteStmt.run(taskId, tagId);

    if (result.changes > 0) {
      res.json({ message: 'Tag removed from task', taskId: parseInt(taskId), tagId: parseInt(tagId) });
    } else {
      res.status(404).json({ error: 'Tag assignment not found' });
    }
  } catch (error) {
    console.error('Error removing tag from task:', error);
    res.status(500).json({ error: 'Failed to remove tag from task' });
  }
});

module.exports = { app, db };