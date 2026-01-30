# UI Guidelines

## Overview
This document outlines the user interface guidelines for the TODO app to ensure a consistent, accessible, and visually appealing experience.

## Design System

### Component Library
**Material-UI (MUI)** is the required component library for this project.

**Installation**:
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

**Core Components to Use**:
- `TextField` - For text input fields
- `Button` - For all interactive buttons
- `Card` / `Paper` - For task containers
- `Checkbox` - For task completion status
- `Chip` - For tags
- `IconButton` - For delete/edit actions
- `DatePicker` - For due date selection (requires @mui/x-date-pickers)
- `Dialog` - For edit/delete confirmations
- `Snackbar` / `Alert` - For user feedback messages

## Color Palette

### Pastel Color Scheme
The application should use a soft, calming pastel color palette:

**Primary Colors**:
- Primary: `#B4A7D6` (Pastel Purple)
- Secondary: `#A8D8EA` (Pastel Blue)

**Accent Colors**:
- Success: `#B8E6D5` (Pastel Mint)
- Warning: `#FFD6A5` (Pastel Peach)
- Error: `#FFADAD` (Pastel Pink)
- Info: `#D4C5F9` (Pastel Lavender)

**Neutral Colors**:
- Background: `#F8F9FA` (Light Gray)
- Surface: `#FFFFFF` (White)
- Text Primary: `#4A5568` (Dark Gray)
- Text Secondary: `#718096` (Medium Gray)

### MUI Theme Configuration
```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#B4A7D6',
      light: '#D6CEEB',
      dark: '#9585B8',
    },
    secondary: {
      main: '#A8D8EA',
      light: '#C7E8F3',
      dark: '#7EBFD4',
    },
    success: {
      main: '#B8E6D5',
    },
    warning: {
      main: '#FFD6A5',
    },
    error: {
      main: '#FFADAD',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#4A5568',
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

## Layout Guidelines

### Spacing
- Use MUI's spacing system: `theme.spacing(n)` where n is a multiplier (1 unit = 8px)
- Standard padding: `theme.spacing(2)` (16px)
- Standard margin between elements: `theme.spacing(2)` (16px)

### Container
- Maximum width: `800px` for main content
- Center-aligned container
- Use `Container` component with `maxWidth="md"`

### Cards/Tasks
- Each task should be displayed in a `Card` or `Paper` component
- Border radius: `8px` (default MUI)
- Box shadow: Use MUI elevation (elevation={2} for normal, elevation={4} for hover)
- Padding: `theme.spacing(2)`

## Component Specifications

### Task Item
```
┌─────────────────────────────────────────────────────┐
│ [✓] Task Name                           [Edit] [Del] │
│     Due: Feb 1, 2026 (Overdue in red if past)       │
│     [Tag1] [Tag2] [Tag3]                            │
└─────────────────────────────────────────────────────┘
```

**Components**:
- `Card` or `Paper` for container
- `Checkbox` for completion status
- `Typography` for task name and due date
- `Chip` components for tags (use pastel colors from palette)
- `IconButton` with Material Icons for actions

### Input Form
- Use `TextField` with outlined variant
- Label: "Add a new task"
- Button: `Button` with variant="contained" and primary color
- Optional fields for due date and tags should be toggleable

### Tags
- Use `Chip` component with pastel colors
- Size: "small" or "medium"
- Variant: "filled" or "outlined"
- Deletable chips for tag management
- Each tag type should have a consistent color

### Buttons
- Primary actions: variant="contained", color="primary"
- Secondary actions: variant="outlined", color="primary"
- Destructive actions: variant="outlined", color="error"
- Icon-only actions: Use `IconButton`

## Typography

### Headings
- App title: `variant="h3"`, `fontWeight="bold"`
- Section titles: `variant="h5"`
- Task names: `variant="body1"`
- Metadata (due date, etc.): `variant="body2"`, `color="text.secondary"`

### Font Weights
- Bold: 700 (for headings)
- Medium: 500 (for task names)
- Regular: 400 (for body text)

## Accessibility

### Requirements
- All interactive elements must be keyboard accessible
- Proper ARIA labels for icon buttons
- Sufficient color contrast (minimum WCAG AA)
- Focus indicators must be visible
- Error messages must be associated with form fields

### MUI Accessibility Features
- Use built-in ARIA props
- Ensure proper label associations
- Use semantic HTML through MUI components

## Responsive Design

### Breakpoints (MUI default)
- xs: 0px (mobile)
- sm: 600px (tablet)
- md: 900px (desktop)
- lg: 1200px (large desktop)

### Mobile Considerations
- Full-width tasks on mobile
- Larger touch targets (minimum 44x44px)
- Bottom sheet or drawer for filters on mobile
- Simplified tag display on small screens

## Animation & Transitions

### Guidelines
- Use MUI's default transitions
- Fade in/out for dialogs and alerts
- Slide transitions for drawers
- Smooth hover effects on cards (use elevation changes)
- Transition duration: 200-300ms for most interactions

### Examples
```javascript
sx={{
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    elevation: 4,
    transform: 'translateY(-2px)',
  },
}}
```

## Feedback & States

### Loading States
- Use `CircularProgress` or `LinearProgress` from MUI
- Display skeleton screens for loading lists
- Disable buttons during async operations

### Empty States
- Show friendly message with an icon when no tasks exist
- Use `Typography` with `color="text.secondary"`
- Include call-to-action to add first task

### Error States
- Use `Alert` component with severity="error"
- Display clear, actionable error messages
- Position at top of relevant section or in `Snackbar`

### Success Feedback
- Use `Snackbar` with `Alert` for success messages
- Auto-dismiss after 3-4 seconds
- Position: bottom-left or top-right

## Implementation Checklist

- [ ] Install Material-UI dependencies
- [ ] Configure MUI theme with pastel color palette
- [ ] Wrap app with `ThemeProvider`
- [ ] Replace existing components with MUI equivalents
- [ ] Implement responsive layout with `Container` and `Grid`
- [ ] Apply consistent spacing using theme spacing system
- [ ] Add proper accessibility attributes
- [ ] Implement loading and error states
- [ ] Test responsive behavior across breakpoints
- [ ] Verify WCAG AA compliance for color contrast
