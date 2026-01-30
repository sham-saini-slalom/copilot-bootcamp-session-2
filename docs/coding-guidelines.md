# Coding Guidelines

## Overview
This document outlines the coding style and quality principles for the TODO app. Consistent code style and adherence to best practices ensure maintainability, readability, and collaboration across the team.

## Core Principles

### 1. Code Quality Fundamentals
- **Readability First**: Code is read far more often than it is written. Prioritize clarity over cleverness.
- **Simplicity**: Keep solutions simple and straightforward. Avoid unnecessary complexity.
- **Consistency**: Follow established patterns and conventions throughout the codebase.
- **Self-Documenting Code**: Write code that explains itself through clear naming and structure.

### 2. DRY Principle (Don't Repeat Yourself)
- Avoid code duplication by extracting common logic into reusable functions or components
- If you find yourself copying and pasting code, consider refactoring into a shared utility
- Use composition and abstraction to reduce redundancy
- Balance DRY with readability—don't over-abstract simple code

**Example**:
```javascript
// ❌ Repetitive
function formatTaskDate(task) {
  const date = new Date(task.dueDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCreatedDate(task) {
  const date = new Date(task.createdAt);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ✅ DRY
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
```

### 3. KISS Principle (Keep It Simple, Stupid)
- Favor simple solutions over complex ones
- Break complex problems into smaller, manageable pieces
- Avoid premature optimization
- Write code that is easy to understand and maintain

### 4. Single Responsibility Principle
- Each function should do one thing well
- Each component should have a single, well-defined purpose
- Keep functions small and focused (ideally under 20-30 lines)
- If a function is doing multiple things, split it into separate functions

## Formatting Rules

### Indentation and Spacing
- Use **2 spaces** for indentation (no tabs)
- Add a blank line between logical blocks of code
- Use consistent spacing around operators and after commas
- Maximum line length: **100 characters** (soft limit, can exceed for readability)

### Semicolons
- Use semicolons at the end of statements
- Be consistent—either always use them or never use them (prefer always using them)

### Quotes
- Use **single quotes** for strings in JavaScript
- Use **double quotes** in JSX attributes
- Use template literals for string interpolation

```javascript
// ✅ Good
const message = 'Hello world';
const greeting = `Hello, ${name}`;
const element = <div className="container">Content</div>;
```

### Braces
- Always use braces for control structures, even for single-line blocks
- Opening brace on the same line (K&R style)

```javascript
// ✅ Good
if (condition) {
  doSomething();
}

// ❌ Avoid
if (condition) doSomething();
```

## Naming Conventions

### Variables and Functions
- Use **camelCase** for variables and functions
- Use descriptive names that convey purpose
- Boolean variables should use prefixes like `is`, `has`, `should`
- Avoid single-letter names except in short loops or callbacks

```javascript
// ✅ Good
const taskList = [];
const isCompleted = true;
const hasError = false;
function calculateDueDate() { }

// ❌ Avoid
const tl = [];
const flag = true;
function calc() { }
```

### Components (React)
- Use **PascalCase** for component names
- Name files the same as the component they contain
- Use descriptive names that indicate the component's purpose

```javascript
// ✅ Good
function TaskItem() { }
function TaskEditDialog() { }

// ❌ Avoid
function task() { }
function Dialog() { } // Too generic
```

### Constants
- Use **UPPER_SNAKE_CASE** for constants
- Define constants at the top of the file or in a separate constants file

```javascript
// ✅ Good
const MAX_TASKS = 100;
const API_BASE_URL = 'http://localhost:3001';
```

### Files and Directories
- Use **camelCase** for utility files: `dateHelpers.js`, `apiClient.js`
- Use **PascalCase** for component files: `TaskItem.js`, `TaskList.js`
- Use **kebab-case** for directory names: `task-components/`, `date-utils/`

## Import Organization

### Import Order
Organize imports in the following order, with blank lines between groups:

1. **External dependencies** (React, third-party libraries)
2. **Internal modules** (utilities, services, components from the project)
3. **Relative imports** (components, files from the same directory)
4. **Styles** (CSS imports)

```javascript
// ✅ Good
// External dependencies
import React, { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import axios from 'axios';

// Internal modules
import { formatDate } from '../../utils/dateHelpers';
import { fetchTasks } from '../../services/taskService';

// Relative imports
import TaskItem from './TaskItem';
import TaskFilter from './TaskFilter';

// Styles
import './TaskList.css';
```

### Import Style
- Use named imports when possible for better tree-shaking
- Destructure imports to make dependencies explicit
- Avoid wildcard imports (`import * as`) unless necessary

```javascript
// ✅ Good
import { useState, useEffect } from 'react';

// ❌ Avoid
import * as React from 'react';
```

## Linter Usage

### ESLint Configuration
The project uses ESLint to enforce coding standards and catch common errors.

**Key Rules**:
- No unused variables
- Consistent quote style
- Proper semicolon usage
- No console.log in production code (use warnings)
- Consistent spacing and indentation

### Running the Linter
```bash
# Lint all files
npm run lint

# Auto-fix issues
npm run lint -- --fix

# Lint specific file
npm run lint -- src/App.js
```

### Pre-commit Hooks
- Linting should run automatically before commits
- Fix linting errors before committing code
- Don't disable linter rules without a good reason

### Disabling Rules
If you must disable a linter rule, provide a comment explaining why:

```javascript
// eslint-disable-next-line no-console -- Needed for debugging in development
console.log('Debug info:', data);
```

## Code Organization

### File Structure
- Keep files focused and under 300 lines when possible
- Extract complex logic into separate modules
- Group related functionality together

### Component Structure (React)
Organize React components in this order:

1. Imports
2. Constants and helper functions
3. Component definition
4. PropTypes or TypeScript types
5. Default props
6. Export statement

```javascript
// Imports
import React, { useState } from 'react';
import { Button } from '@mui/material';

// Constants
const MAX_TASK_LENGTH = 100;

// Helper functions
function validateTask(task) {
  return task.length > 0 && task.length <= MAX_TASK_LENGTH;
}

// Component
function TaskInput({ onAdd }) {
  const [task, setTask] = useState('');
  
  const handleSubmit = () => {
    if (validateTask(task)) {
      onAdd(task);
      setTask('');
    }
  };
  
  return (
    <div>
      <input value={task} onChange={(e) => setTask(e.target.value)} />
      <Button onClick={handleSubmit}>Add</Button>
    </div>
  );
}

// Export
export default TaskInput;
```

## Comments and Documentation

### When to Comment
- Explain **why**, not **what** (the code should show what it does)
- Document complex algorithms or business logic
- Add TODO comments for incomplete features
- Use JSDoc for function documentation when beneficial

```javascript
// ✅ Good - Explains why
// Using a 7-day grace period to avoid overwhelming users with overdue tasks
const GRACE_PERIOD_DAYS = 7;

// ❌ Avoid - States the obvious
// Increment counter by 1
counter++;
```

### JSDoc for Functions
Use JSDoc to document public APIs and complex functions:

```javascript
/**
 * Calculates the number of days until a task is due
 * @param {string} dueDate - ISO date string
 * @returns {number} Number of days until due (negative if overdue)
 */
function getDaysUntilDue(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
```

### TODO Comments
Use consistent format for TODO comments:

```javascript
// TODO: Add validation for past dates
// FIXME: This function has a race condition
// NOTE: This is a temporary workaround until API v2 is ready
```

## Error Handling

### Best Practices
- Always handle errors explicitly
- Provide meaningful error messages
- Use try-catch for async operations
- Don't swallow errors silently

```javascript
// ✅ Good
async function fetchTasks() {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error; // Re-throw to let caller handle it
  }
}

// ❌ Avoid
async function fetchTasks() {
  try {
    const response = await fetch('/api/tasks');
    return await response.json();
  } catch (error) {
    // Silent failure
  }
}
```

## Performance Considerations

### Best Practices
- Avoid premature optimization
- Use React.memo() for expensive components
- Debounce or throttle frequent operations (search, scroll)
- Use lazy loading for code splitting when appropriate
- Minimize unnecessary re-renders

### Example: Debouncing Input
```javascript
import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

function SearchInput({ onSearch }) {
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      onSearch(query);
    }, 300);
    
    debouncedSearch();
    
    return () => debouncedSearch.cancel();
  }, [query, onSearch]);
  
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

## Accessibility

### Requirements
- All interactive elements must be keyboard accessible
- Use semantic HTML elements
- Provide ARIA labels for icon buttons and non-obvious controls
- Ensure sufficient color contrast
- Test with screen readers

```javascript
// ✅ Good
<button aria-label="Delete task" onClick={handleDelete}>
  <DeleteIcon />
</button>

// ❌ Avoid
<div onClick={handleDelete}>
  <DeleteIcon />
</div>
```

## Git Commit Guidelines

### Commit Messages
Use clear, descriptive commit messages following this format:

```
<type>: <short summary>

<optional detailed description>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Formatting changes
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `chore`: Maintenance tasks

**Examples**:
```
feat: add due date picker to task creation form
fix: resolve task deletion race condition
refactor: extract date formatting logic to utility
test: add unit tests for task validation
```

### Commit Frequency
- Commit often with logical, atomic changes
- Each commit should represent a single logical change
- Don't commit broken code to main branch

## Code Review Checklist

Before submitting code for review, ensure:

- [ ] Code follows the style guidelines in this document
- [ ] All linter errors and warnings are resolved
- [ ] Tests are written and passing
- [ ] No commented-out code or debug statements
- [ ] Variable and function names are descriptive
- [ ] Complex logic is documented
- [ ] No console.log statements in production code
- [ ] Imports are organized correctly
- [ ] Error handling is implemented
- [ ] Accessibility requirements are met

## Tools and Editor Setup

### Recommended VS Code Extensions
- **ESLint**: Real-time linting
- **Prettier**: Code formatting
- **Auto Import**: Automatic import suggestions
- **GitLens**: Git integration

### VS Code Settings
Configure your editor to format on save:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "javascriptreact"],
  "editor.tabSize": 2
}
```

## Resources

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React Best Practices](https://react.dev/learn)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [ESLint Documentation](https://eslint.org/docs/latest/)

## Maintenance

This document should be reviewed and updated:
- When new patterns or conventions are adopted
- After team discussions about code quality
- When new tools or libraries are introduced
- At least once per quarter
