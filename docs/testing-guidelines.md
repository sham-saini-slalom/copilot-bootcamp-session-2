# Testing Guidelines

## Overview
This document outlines the testing principles and requirements for the TODO app. All code should be thoroughly tested to ensure reliability, maintainability, and confidence in deployments.

## Testing Philosophy

### Core Principles
1. **Test Coverage**: All new features must include appropriate tests
2. **Maintainability**: Tests should be easy to understand, update, and debug
3. **Test Pyramid**: Follow the testing pyramid with more unit tests than integration tests, and more integration tests than end-to-end tests
4. **Fast Feedback**: Tests should run quickly to enable rapid development cycles
5. **Reliability**: Tests should be deterministic and not flaky

## Testing Requirements

### 1. Unit Tests
**Purpose**: Test individual functions, components, or modules in isolation.

**Requirements**:
- All utility functions must have unit tests
- React components should have unit tests for:
  - Component rendering
  - User interactions (clicks, input changes)
  - Conditional rendering logic
  - State management
- Backend services and utilities must be unit tested
- Aim for 80%+ code coverage for critical business logic

**Tools**:
- Jest for test runner and assertions
- React Testing Library for component testing
- Mock external dependencies and API calls

**Example**:
```javascript
// Component unit test
test('should render task with due date', () => {
  const task = { id: 1, name: 'Test Task', dueDate: '2026-02-01' };
  render(<TaskItem task={task} />);
  expect(screen.getByText('Test Task')).toBeInTheDocument();
  expect(screen.getByText(/Feb 1, 2026/)).toBeInTheDocument();
});
```

### 2. Integration Tests
**Purpose**: Test how multiple components or modules work together.

**Requirements**:
- Test API endpoints with database interactions
- Test complex user flows involving multiple components
- Test state management across component hierarchies
- Verify data flow between frontend and backend
- Test error handling and edge cases

**Tools**:
- Jest for test runner
- Supertest for API testing
- React Testing Library for component integration
- In-memory database or test database for backend tests

**Example**:
```javascript
// API integration test
test('POST /api/tasks should create a new task', async () => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ name: 'New Task', dueDate: '2026-02-01' });
  
  expect(response.status).toBe(201);
  expect(response.body.name).toBe('New Task');
});
```

### 3. End-to-End Tests
**Purpose**: Test complete user workflows from the UI through the entire system.

**Requirements**:
- Test critical user journeys (create task, edit task, delete task)
- Test cross-browser compatibility
- Verify application behavior in production-like environment
- Test authentication flows (if applicable)
- Aim for coverage of main user paths, not exhaustive testing

**Tools** (to be implemented):
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
- Overall coverage: 80%+
- Critical business logic: 90%+
- Utility functions: 95%+

**Coverage Reports**:
- Run `npm test -- --coverage` to generate coverage reports
- Review coverage reports before merging PRs
- Focus on meaningful coverage, not just hitting numbers

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
- Unit test: Due date validation logic
- Unit test: Overdue date calculation
- Integration test: Creating task with due date via API
- Component test: Due date display in task item
- E2E test: Add task with due date through UI

### Task Editing Feature
- Unit test: Edit form validation
- Integration test: Update task via API
- Component test: Edit dialog behavior
- E2E test: Complete edit workflow

### Task Tags Feature
- Unit test: Tag creation and validation
- Integration test: Filter tasks by tags
- Component test: Tag chip rendering
- E2E test: Assign and remove tags

## Testing Checklist

Before submitting a pull request, ensure:

- [ ] All new code has appropriate unit tests
- [ ] Integration tests cover API endpoints and data flows
- [ ] E2E tests cover critical user paths (if applicable)
- [ ] All tests pass locally
- [ ] Code coverage meets minimum thresholds
- [ ] Tests are maintainable and follow best practices
- [ ] Test names clearly describe what is being tested
- [ ] No flaky or intermittent test failures
- [ ] Mock data is realistic and covers edge cases

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
