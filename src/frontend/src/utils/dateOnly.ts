/**
 * Date-only utility for timezone-safe age calculation.
 * Parses DOB in YYYY-MM-DD format without timezone conversion.
 */

interface DateComponents {
  year: number;
  month: number; // 1-12
  day: number;
}

/**
 * Parse a date string in YYYY-MM-DD format into date components.
 * Returns null if the format is invalid or the date is not valid.
 */
function parseDateString(dateStr: string): DateComponents | null {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return null;
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Basic validation
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }

  if (month < 1 || month > 12) {
    return null;
  }

  if (day < 1 || day > 31) {
    return null;
  }

  // Additional validation for days in month (simplified)
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) {
    return null;
  }

  return { year, month, day };
}

/**
 * Get today's date components in local timezone.
 */
function getTodayComponents(): DateComponents {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // getMonth() returns 0-11
    day: now.getDate(),
  };
}

/**
 * Calculate age in whole years based on DOB string (YYYY-MM-DD).
 * Uses date-only logic to avoid timezone/DST day shifting.
 * Returns null if DOB is invalid or unparseable.
 * 
 * @param dob - Date of birth in YYYY-MM-DD format
 * @param today - Optional today's date components (for testing)
 * @returns Age in years, or null if invalid
 */
export function calculateAgeYears(
  dob: string,
  today?: DateComponents
): number | null {
  const dobComponents = parseDateString(dob);
  if (!dobComponents) {
    return null;
  }

  const todayComponents = today || getTodayComponents();

  // Calculate age based on year difference
  let age = todayComponents.year - dobComponents.year;

  // Adjust if birthday hasn't occurred yet this year
  const birthdayPassed =
    todayComponents.month > dobComponents.month ||
    (todayComponents.month === dobComponents.month && todayComponents.day >= dobComponents.day);

  if (!birthdayPassed) {
    age -= 1;
  }

  // Sanity check: age should be non-negative and reasonable
  if (age < 0 || age > 150) {
    return null;
  }

  return age;
}

/**
 * Format age for display.
 * Returns a formatted string or a fallback for invalid ages.
 */
export function formatAge(age: number | null): string {
  if (age === null) {
    return '—';
  }
  return age.toString();
}
