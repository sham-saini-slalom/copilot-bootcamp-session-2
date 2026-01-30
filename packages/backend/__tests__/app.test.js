const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createTask = async (title = 'Test Task', completed = false, dueDate = null) => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title, completed, dueDate })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if tasks have the expected structure
      const task = response.body[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('completed');
      expect(task).toHaveProperty('created_at');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = { title: 'Test Task' };
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.completed).toBe(0);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should create a task with due date', async () => {
      const newTask = { title: 'Task with due date', dueDate: '2026-02-15' };
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.due_date).toBe(newTask.dueDate);
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task title is required');
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task title is required');
    });

    it('should return 400 if title exceeds max length', async () => {
      const longTitle = 'a'.repeat(201);
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: longTitle })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Task title must be 200 characters or less');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task title', async () => {
      const task = await createTask('Original Title');
      const updatedTitle = 'Updated Title';

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: updatedTitle })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedTitle);
      expect(response.body.id).toBe(task.id);
    });

    it('should update task completion status', async () => {
      const task = await createTask('Task to Complete');

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ completed: true })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(1);
    });

    it('should update task due date', async () => {
      const task = await createTask('Task with due date');
      const dueDate = '2026-03-01';

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ dueDate })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.due_date).toBe(dueDate);
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app)
        .put('/api/tasks/999999')
        .send({ title: 'Updated' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 if title is empty', async () => {
      const task = await createTask('Task to Update');

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Task title cannot be empty');
    });

    it('should return 400 if no fields to update', async () => {
      const task = await createTask('Task');

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No fields to update');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      const task = await createTask('Task To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/tasks/${task.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: task.id });

      const deleteAgain = await request(app).delete(`/api/tasks/${task.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app).delete('/api/tasks/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/tasks/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid task ID is required');
    });
  });
});