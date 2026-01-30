# Testing Guidelines

## Overview
This document outlines the testing principles and requirements for the TODO app. Focus on testing what matters: critical functionality, complex logic, and user-facing features. Avoid over-testing simple code.

## Testing Philosophy

### Core Principles
1. **Test What Matters**: Focus on critical paths, complex logic, and high-risk areas
2. **Pragmatic Coverage**: Write tests that provide value, not just to hit coverage numbers
3. **Maintainability**: Tests should be easy to understand, update, and debug
4. **Test Pyramid**: More unit tests for complex logic, fewer integration tests, minimal E2E tests
5. **Fast Feedback**: Tests should run quickly to enable rapid development cycles
6. **Reliability**: Tests should be deterministic and not flaky
7. **ROI-Focused**: Prioritize tests with the highest return on investment

## Testing Requirements

### What to Test (Priority Order)

#### **Must Test** ✅
1. **Critical business logic**: Task creation, editing, deletion, completion
2. **Data validation**: Input validation, date parsing, tag validation
3. **Complex utility functions**: Date calculations, filtering logic, sorting
4. **API endpoints**: Core CRUD operations
5. **Error handling**: Edge cases, invalid inputs, network failures

#### **Should Test** 🟡
1. **Component integration**: Multi-component workflows
2. **State management**: Complex state transitions
3. **User interactions**: Form submissions, button clicks with side effects

#### **Can Skip** ⏭️
1. **Simple presentational components**: Basic display components without logic
2. **Trivial functions**: Simple getters, one-line formatters
3. **Third-party library wrappers**: Unless adding custom logic
4. **Generated code**: Boilerplate, auto-generated files

---

### 1. Unit Tests
**Purpose**: Test individual functions, components, or modules in isolation.

**Requirements**:
- Test complex utility functions (date calculations, validation logic)
- Test React components with business logic:
  - Components with conditional rendering
  - Components with user interactions that trigger side effects
  - Components with state management
- Test backend validation and data transformation logic
- Aim for **60-70% code coverage** overall, **80%+ for critical paths**

**Tools**:
- Jest for test runner and assertions
- React Testing Library for component testing
- Mock external dependencies and API calls

**Examples**:
```javascript
// ✅ Test complex logic - REQUIRED
test('should correctly identify overdue tasks', () => {
  const pastDate = '2026-01-01';
  const futureDate = '2026-12-31';
  expect(isOverdue(pastDate)).toBe(true);
  expect(isOverdue(futureDate)).toBe(false);
});

// ✅ Test critical user interaction - REQUIRED
test('should add task when form is submitted with valid data', async () => {
  render(<TaskForm onAdd={mockAdd} />);
  fireEvent.change(screen.getByPlaceholderText('Add a new task'), {
    target: { value: 'New Task' }
  });
  fireEvent.click(screen.getByText('Add'));
  await waitFor(() => {
    expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Task' }));
  });
});

// ⏭️ Simple component - CAN SKIP
// No need to test simple display component:
// function TaskTitle({ title }) { return <h2>{title}</h2>; }
```

### 2. Integration Tests
**Purpose**: Test how multiple components or modules work together.

**Requirements**:
- Test API endpoints with database interactions
- Test critical user flows involving multiple components
- Test error handling and edge cases for critical paths
- **Focus on high-value integrations only**

**Tools**:
- Jest for test runner
- Supertest for API testing
- React Testing Library for component integration
- In-memory database or test database for backend tests

**Examples**:
```javascript
// ✅ Critical API endpoint - REQUIRED
test('POST /api/tasks should create a new task with validation', async () => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title: 'New Task', dueDate: '2026-02-01' });
  
  expect(response.status).toBe(201);
  expect(response.body.title).toBe('New Task');
  
  // Verify it's in the database
  const tasks = await request(app).get('/api/tasks');
  expect(tasks.body).toContainEqual(expect.objectContaining({ title: 'New Task' }));
});

// ✅ Error handling - REQUIRED
test('POST /api/tasks should return 400 for invalid data', async () => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title: '' });
  
  expect(response.status).toBe(400);
  expect(response.body.error).toBeDefined();
});
```

### 3. End-to-End Tests
**Purpose**: Test complete user workflows from the UI through the entire system.

**Requirements**:
- **Test ONLY critical user journeys** (create task, edit task, delete task)
- Keep E2E tests minimal - they are slow and brittle
- **Recommended: 3-5 E2E tests maximum for this app**
- Run in CI/CD pipeline before production deployment

**Tools** (Optional - implement only if needed):
- Playwright or Cypress for browser automation
- Test against a running instance of the application

**Example**:
```javascript
// E2E test example (Playwright)
test('user can create and complete a task', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('[placeholder="Add a new task"]', 'Buy groceries');
  await page.click('button:has-text("Add")');
  await expect(page.locator('text=Buy groceries')).toBeVisible();
  await page.click('[aria-label="Mark task as complete"]');
  await expect(page.locator('text=Buy groceries')).toHaveClass(/completed/);
});
```

**Note**: E2E tests are **optional** for this project. Focus on unit and integration tests first.

## Best Practices

### Writing Maintainable Tests

#### 1. Clear Test Names
- Use descriptive test names that explain what is being tested
- Follow the pattern: "should [expected behavior] when [condition]"
- Example: `should display error message when due date is in the past`

#### 2. Arrange-Act-Assert Pattern
```javascript
test('should add a new task to the list', () => {
  // Arrange
  const initialTasks = [{ id: 1, name: 'Task 1' }];
  render(<TaskList tasks={initialTasks} />);
  
  // Act
  fireEvent.click(screen.getByText('Add Task'));
  fireEvent.change(screen.getByPlaceholderText('Task name'), {
    target: { value: 'Task 2' }
  });
  fireEvent.click(screen.getByText('Save'));
  
  // Assert
  expect(screen.getByText('Task 2')).toBeInTheDocument();
});
```

#### 3. Avoid Test Interdependence
- Each test should be independent and not rely on other tests
- Use setup/teardown hooks to reset state between tests
- Don't share mutable state between tests

#### 4. Use Test Helpers and Utilities
- Create reusable test utilities for common operations
- Extract complex setup logic into helper functions
- Example: `createMockTask()`, `renderWithProviders()`

#### 5. Mock External Dependencies
- Mock API calls, databases, and external services
- Use consistent mocking patterns across the codebase
- Don't test third-party libraries

#### 6. Test Behavior, Not Implementation
- Focus on what the component does, not how it does it
- Avoid testing internal state or implementation details
- Test from the user's perspective

### Code Coverage

**Targets**:
- Overall coverage: **60-70%** (pragmatic, not exhaustive)
- Critical business logic: **80%+** (high-value code)
- Utility functions with complexity: **90%+**
- Simple presentational components: **Skip or minimal**

**Coverage Reports**:
- Run `npm test -- --coverage` to generate coverage reports
- Review coverage reports before merging PRs
- **Focus on meaningful coverage, not just hitting numbers**
- Missing coverage in trivial code is acceptable

**What Coverage Doesn't Mean**:
- High coverage ≠ good tests
- Low coverage in simple code is OK
- Prioritize test quality over coverage percentage

### Test Organization

**Directory Structure**:
```
packages/
  frontend/
    src/
      components/
        TaskItem.js
        __tests__/
          TaskItem.test.js
      utils/
        dateHelpers.js
        __tests__/
          dateHelpers.test.js
  backend/
    src/
      routes/
        tasks.js
        __tests__/
          tasks.test.js
```

**File Naming**:
- Unit/Integration tests: `[filename].test.js`
- E2E tests: `[feature].e2e.test.js`

### Continuous Integration

**Requirements**:
- All tests must pass before code can be merged
- Run tests on every pull request
- Fail the build if coverage drops below thresholds
- Run E2E tests on staging environment before production deployment

## Feature-Specific Testing Requirements

### Task Due Date Feature
**Essential Tests**:
- ✅ Unit test: Overdue date calculation (critical logic)
- ✅ Integration test: Creating task with due date via API
- ✅ Component test: Due date display with overdue indicator
- ⏭️ Skip: Simple date formatting functions (use existing library)

### Task Editing Feature
**Essential Tests**:
- ✅ Unit test: Edit form validation (critical business rule)
- ✅ Integration test: Update task via API
- ✅ Component test: Edit dialog opens and submits correctly
- ⏭️ Skip: Simple input field rendering

### Task Tags Feature
**Essential Tests**:
- ✅ Unit test: Tag validation (unique names, required fields)
- ✅ Integration test: Filter tasks by tags (complex query)
- ✅ Component test: Tag assignment and removal
- ⏭️ Skip: Tag color picker display (simple UI component)

## Testing Checklist

Before submitting a pull request, ensure:

- [ ] Critical business logic has unit tests
- [ ] API endpoints have integration tests for happy path and error cases
- [ ] Complex user interactions are tested
- [ ] All tests pass locally
- [ ] Code coverage meets minimum thresholds (60-70% overall)
- [ ] Tests are maintainable and follow best practices
- [ ] Test names clearly describe what is being tested
- [ ] No flaky or intermittent test failures
- [ ] Mock data is realistic and covers edge cases

**Note**: Don't feel pressured to test everything. Focus on what provides value.

## Running Tests

### All Tests
```bash
npm test
```

### Specific Package
```bash
npm test -w packages/frontend
npm test -w packages/backend
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm test -- --coverage
```

### Single Test File
```bash
npm test -- TaskItem.test.js
```

## Debugging Tests

### Common Issues
1. **Async timing issues**: Use `waitFor`, `findBy` queries, or `async/await`
2. **DOM cleanup**: Ensure `cleanup` is called between tests (automatic with Testing Library)
3. **Mock not working**: Verify mock is set up before the module is imported
4. **Flaky tests**: Check for race conditions, insufficient waits, or shared state

### Debug Tools
- Use `screen.debug()` to print current DOM state
- Use `--verbose` flag for detailed test output
- Use `.only()` to run a single test during debugging
- Set breakpoints in test files when running in debug mode

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Playwright Documentation](https://playwright.dev/)

## Maintenance

This document should be reviewed and updated:
- When new testing tools are introduced
- When testing patterns change
- After retrospectives identify testing pain points
- At least once per quarter
