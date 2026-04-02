/**
 * Date range parsing and validation for security reports.
 */
function parseDateRange(fromStr, toStr) {
  if (!fromStr || !toStr) {
    return { error: 'Start date and end date are required.' };
  }
  const fromDate = new Date(fromStr);
  const toDate = new Date(toStr);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return { error: 'Invalid date format. Use YYYY-MM-DD.' };
  }
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);
  if (fromDate > toDate) {
    return { error: 'Start date must be before or equal to end date.' };
  }
  return { fromDate, toDate };
}

/**
 * Hours between HH:MM and HH:MM (same day).
 */
function bookingDurationHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = String(startTime).split(':').map(Number);
  const [eh, em] = String(endTime).split(':').map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0;
  const startM = sh * 60 + sm;
  const endM = eh * 60 + em;
  return Math.max(0, (endM - startM) / 60);
}

function computePropertyUsageHours(bookings, properties) {
  const byId = {};
  properties.forEach((p) => {
    byId[p._id.toString()] = {
      propertyId: p._id,
      title: p.title,
      totalHours: 0,
      bookingCount: 0
    };
  });

  bookings.forEach((b) => {
    if (b.status === 'cancelled') return;
    const id = b.facilityId?.toString();
    if (!id || !byId[id]) return;
    const h = bookingDurationHours(b.startTime, b.endTime);
    byId[id].totalHours += h;
    byId[id].bookingCount += 1;
  });

  return Object.values(byId).map((row) => ({
    ...row,
    totalHours: Math.round(row.totalHours * 100) / 100
  }));
}

module.exports = {
  parseDateRange,
  bookingDurationHours,
  computePropertyUsageHours
};
