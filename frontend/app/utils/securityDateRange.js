/**
 * Client-side date range validation (YYYY-MM-DD).
 * @returns {string|null} error message or null if valid
 */
export function validateDateRange(fromStr, toStr) {
  if (!fromStr || !toStr) {
    return 'Please select both start date and end date.';
  }
  const from = new Date(`${fromStr}T00:00:00`);
  const to = new Date(`${toStr}T23:59:59`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return 'Invalid dates selected.';
  }
  if (from > to) {
    return 'Start date must be before or equal to end date.';
  }
  return null;
}

export function todayIsoDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysAgoIsoDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
