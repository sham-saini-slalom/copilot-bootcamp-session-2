import {
  formatDate,
  isOverdue,
  getDaysUntilDue,
  isDueSoon,
  formatRelativeDate,
  getDueDateColor,
  isValidDate,
} from '../dateHelpers';

describe('dateHelpers', () => {
  // Use a fixed date for testing: January 30, 2026
  const TODAY = '2026-01-30';

  describe('formatDate', () => {
    it('should format ISO date string correctly', () => {
      expect(formatDate('2026-02-15')).toBe('Feb 15, 2026');
      expect(formatDate('2026-12-31')).toBe('Dec 31, 2026');
    });

    it('should return empty string for null or undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });

    it('should handle invalid date strings gracefully', () => {
      const result = formatDate('invalid-date');
      expect(typeof result).toBe('string');
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      expect(isOverdue('2026-01-01')).toBe(true);
      expect(isOverdue('2025-12-31')).toBe(true);
    });

    it('should return false for today', () => {
      expect(isOverdue(TODAY)).toBe(false);
    });

    it('should return false for future dates', () => {
      expect(isOverdue('2026-02-01')).toBe(false);
      expect(isOverdue('2027-01-01')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isOverdue(null)).toBe(false);
      expect(isOverdue(undefined)).toBe(false);
      expect(isOverdue('')).toBe(false);
    });
  });

  describe('getDaysUntilDue', () => {
    it('should calculate positive days for future dates', () => {
      const result = getDaysUntilDue('2026-02-05');
      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for today', () => {
      expect(getDaysUntilDue(TODAY)).toBe(0);
    });

    it('should calculate negative days for past dates', () => {
      const result = getDaysUntilDue('2026-01-15');
      expect(result).toBeLessThan(0);
    });

    it('should return null for invalid input', () => {
      expect(getDaysUntilDue(null)).toBe(null);
      expect(getDaysUntilDue(undefined)).toBe(null);
      expect(getDaysUntilDue('')).toBe(null);
    });
  });

  describe('isDueSoon', () => {
    it('should return true for dates within warning threshold', () => {
      expect(isDueSoon('2026-01-31')).toBe(true); // 1 day away
      expect(isDueSoon('2026-02-02')).toBe(true); // 3 days away
    });

    it('should return false for dates beyond warning threshold', () => {
      expect(isDueSoon('2026-02-10')).toBe(false); // More than 3 days
    });

    it('should return false for overdue dates', () => {
      expect(isDueSoon('2026-01-15')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isDueSoon(null)).toBe(false);
      expect(isDueSoon(undefined)).toBe(false);
      expect(isDueSoon('')).toBe(false);
    });
  });

  describe('formatRelativeDate', () => {
    it('should format overdue dates correctly', () => {
      expect(formatRelativeDate('2026-01-29')).toBe('Overdue by 1 day');
      expect(formatRelativeDate('2026-01-25')).toBe('Overdue by 5 days');
    });

    it('should format today correctly', () => {
      expect(formatRelativeDate(TODAY)).toBe('Due today');
    });

    it('should format tomorrow correctly', () => {
      expect(formatRelativeDate('2026-01-31')).toBe('Due tomorrow');
    });

    it('should format future dates correctly', () => {
      expect(formatRelativeDate('2026-02-02')).toBe('Due in 3 days');
      expect(formatRelativeDate('2026-02-14')).toBe('Due in 15 days');
    });

    it('should return empty string for invalid input', () => {
      expect(formatRelativeDate(null)).toBe('');
      expect(formatRelativeDate(undefined)).toBe('');
      expect(formatRelativeDate('')).toBe('');
    });
  });

  describe('getDueDateColor', () => {
    it('should return success for completed tasks', () => {
      expect(getDueDateColor('2026-01-15', true)).toBe('success');
      expect(getDueDateColor('2026-02-15', true)).toBe('success');
    });

    it('should return error for overdue tasks', () => {
      expect(getDueDateColor('2026-01-15', false)).toBe('error');
    });

    it('should return warning for tasks due soon', () => {
      expect(getDueDateColor('2026-01-31', false)).toBe('warning');
      expect(getDueDateColor('2026-02-02', false)).toBe('warning');
    });

    it('should return default for future tasks', () => {
      expect(getDueDateColor('2026-03-01', false)).toBe('default');
    });

    it('should return default for tasks without due date', () => {
      expect(getDueDateColor(null, false)).toBe('default');
      expect(getDueDateColor(undefined, false)).toBe('default');
      expect(getDueDateColor('', false)).toBe('default');
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid ISO date strings', () => {
      expect(isValidDate('2026-01-30')).toBe(true);
      expect(isValidDate('2026-12-31')).toBe(true);
    });

    it('should return false for invalid date strings', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('2026-13-01')).toBe(false);
      expect(isValidDate('not-a-date')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });
});
