import { format, parseISO, differenceInDays, isAfter, isBefore, startOfToday } from 'date-fns';
import { DATE_FORMAT, DAYS_UNTIL_DUE_WARNING } from './constants';

/**
 * Formats a date string for display
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {string} Formatted date string (e.g., "Feb 15, 2026")
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, DATE_FORMAT);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Checks if a task is overdue
 * @param {string} dueDate - ISO date string (YYYY-MM-DD)
 * @returns {boolean} True if the task is overdue
 */
export function isOverdue(dueDate) {
  if (!dueDate) return false;
  try {
    const due = parseISO(dueDate);
    const today = startOfToday();
    return isBefore(due, today);
  } catch (error) {
    console.error('Error checking overdue status:', error);
    return false;
  }
}

/**
 * Calculates the number of days until a task is due
 * @param {string} dueDate - ISO date string (YYYY-MM-DD)
 * @returns {number} Number of days until due (negative if overdue, 0 if today)
 */
export function getDaysUntilDue(dueDate) {
  if (!dueDate) return null;
  try {
    const due = parseISO(dueDate);
    const today = startOfToday();
    return differenceInDays(due, today);
  } catch (error) {
    console.error('Error calculating days until due:', error);
    return null;
  }
}

/**
 * Checks if a task is due soon (within warning threshold)
 * @param {string} dueDate - ISO date string (YYYY-MM-DD)
 * @returns {boolean} True if the task is due soon but not overdue
 */
export function isDueSoon(dueDate) {
  if (!dueDate) return false;
  try {
    const daysUntil = getDaysUntilDue(dueDate);
    if (daysUntil === null) return false;
    return daysUntil >= 0 && daysUntil <= DAYS_UNTIL_DUE_WARNING;
  } catch (error) {
    console.error('Error checking if due soon:', error);
    return false;
  }
}

/**
 * Formats a date string as relative time (e.g., "in 3 days", "overdue by 2 days")
 * @param {string} dueDate - ISO date string (YYYY-MM-DD)
 * @returns {string} Relative date string
 */
export function formatRelativeDate(dueDate) {
  if (!dueDate) return '';
  try {
    const daysUntil = getDaysUntilDue(dueDate);
    if (daysUntil === null) return '';

    if (daysUntil < 0) {
      const daysOverdue = Math.abs(daysUntil);
      return daysOverdue === 1 ? 'Overdue by 1 day' : `Overdue by ${daysOverdue} days`;
    } else if (daysUntil === 0) {
      return 'Due today';
    } else if (daysUntil === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysUntil} days`;
    }
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
}

/**
 * Gets the appropriate color for a task based on its due date status
 * @param {string} dueDate - ISO date string (YYYY-MM-DD)
 * @param {boolean} completed - Whether the task is completed
 * @returns {string} Color identifier ('error', 'warning', 'success', 'default')
 */
export function getDueDateColor(dueDate, completed) {
  if (completed) return 'success';
  if (!dueDate) return 'default';

  if (isOverdue(dueDate)) return 'error';
  if (isDueSoon(dueDate)) return 'warning';
  return 'default';
}

/**
 * Validates a date string
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid ISO date format
 */
export function isValidDate(dateString) {
  if (!dateString) return false;
  try {
    const date = parseISO(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
}
