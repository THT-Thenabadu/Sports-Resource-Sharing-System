const mongoose = require('mongoose');  //67 89 205
const Property = require('../../models/Property');
const EntryLog = require('../models/EntryLog');
const Booking = require('../../Booking/models/Booking');
const {
  parseDateRange,
  computePropertyUsageHours
} = require('../utils/securityReportHelpers');
const { streamSecurityReportPdf } = require('../utils/buildSecurityReportPdf');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getOwnerPropertyIds(ownerId) {
  const props = await Property.find({ owner: ownerId }).select('_id title availabilityState openingTime closingTime');
  return props;
}

exports.getAvailability = async (req, res) => {
  try {
    const properties = await getOwnerPropertyIds(req.user.id);
    const total = properties.length;
    const available = properties.filter((p) => (p.availabilityState || 'available') === 'available').length;
    const notAvailable = total - available;

    res.status(200).json({
      summary: { total, available, notAvailable },
      properties
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { view = 'all', from, to, q } = req.query;
    const properties = await getOwnerPropertyIds(req.user.id);
    const objectIds = properties.map((p) => new mongoose.Types.ObjectId(p._id));

    const filter = { facilityId: { $in: objectIds } };
    if (view === 'upcoming') filter.status = 'pending';
    if (view === 'current') filter.status = 'checkedin';

    if (view === 'all' && req.query.status) {
      const ok = ['pending', 'confirmed', 'checkedin', 'checkedout', 'cancelled'].includes(req.query.status);
      if (ok) filter.status = req.query.status;
    }

    if (from && to) {
      const r = parseDateRange(from, to);
      if (r.error) return res.status(400).json({ message: r.error });
      filter.date = { $gte: r.fromDate, $lte: r.toDate };
    }

    if (q && String(q).trim()) {
      filter.facilityName = new RegExp(escapeRegex(String(q).trim()), 'i');
    }

    const bookings = await Booking.find(filter).sort({ date: 1, startTime: 1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//validate and update booking status (e.g. check-in, check-out) by security officers
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'checkedin', 'checkedout'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const properties = await getOwnerPropertyIds(req.user.id);
    const objectIds = properties.map((p) => new mongoose.Types.ObjectId(p._id));
    const booking = await Booking.findOne({ _id: req.params.id, facilityId: { $in: objectIds } });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    booking.status = status;
    await booking.save();
    res.status(200).json({ message: 'Booking status updated.', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validate access code (QR or token) and check-in if valid
exports.scanAccessCode = async (req, res) => {
  try {
    const { code } = req.body;

  //check if code is present
    if (!code) return res.status(400).json({ message: 'Token or QR code is required.' });

    // Ensure we only look at bookings for properties this officer manages
    const properties = await getOwnerPropertyIds(req.user.id);
    const objectIds = properties.map((p) => new mongoose.Types.ObjectId(p._id));

    const bookings = await Booking.find({ 
      accessCode: String(code).toUpperCase(), 
      facilityId: { $in: objectIds } 
    }).sort({ date: 1, startTime: 1 });

    //Checks if the token matches a real booking
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'Invalid QR or Token: No booking found.' });
    }

    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    
    
    const bookingDateStr = new Date(bookings[0].date).toLocaleDateString('en-CA');
    
    
    // But string comparison YYYY-MM-DD < YYYY-MM-DD is exceptionally safe.
    if (bookingDateStr < todayStr) {
      return res.status(400).json({ message: 'QR Expired: This booking was for a past date.' });
    }

   //check QR already used (checked-in) or not
    const allUsed = bookings.every(b => ['checkedin', 'checkedout'].includes(b.status));
    if (allUsed) {
      return res.status(400).json({ message: 'Already Used: This QR code has already been scanned and checked-in.' });
    }

    // Check-in the bookings that are pending or confirmed
    for (const b of bookings) {
      if (['pending', 'confirmed'].includes(b.status)) {
        b.status = 'checkedin';
        await b.save();
      }
    }

    res.status(200).json({ 
      message: 'Successfully checked in!', 
      bookings 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEntryLogs = async (req, res) => {
  try {
    const { date, from, to, type, q } = req.query;
    const filter = { owner: req.user.id };

    if (date) {
      const day = new Date(date);
      day.setHours(0, 0, 0, 0);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      filter.logDate = { $gte: day, $lt: next };
    } else if (from && to) {
      const r = parseDateRange(from, to);
      if (r.error) return res.status(400).json({ message: r.error });
      filter.logDate = { $gte: r.fromDate, $lte: r.toDate };
    }

    if (type && ['Visitor', 'Member', 'Service'].includes(type)) {
      filter.type = type;
    }

    let query = EntryLog.find(filter).sort({ createdAt: -1 });
    const logs = await query;

    let list = logs;
    if (q && String(q).trim()) {
      const re = new RegExp(escapeRegex(String(q).trim()), 'i');
      list = logs.filter((l) => re.test(l.name) || re.test(l.facility));
    }

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEntryLog = async (req, res) => {
  try {
    const { name, type, facility, entryTime, exitTime, idVerified } = req.body;
    const log = await EntryLog.create({
      owner: req.user.id,
      name,
      type,
      facility,
      entryTime,
      exitTime: exitTime || '',
      idVerified: Boolean(idVerified),
      logDate: new Date()
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markEntryLogExit = async (req, res) => {
  try {
    const log = await EntryLog.findOne({ _id: req.params.id, owner: req.user.id });
    if (!log) return res.status(404).json({ message: 'Entry log not found.' });
    
    // Set exit time to current HH:MM
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    log.exitTime = `${hh}:${mm}`;
    await log.save();

    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


async function buildReportData(ownerId, fromStr, toStr, reportType) {
  const r = parseDateRange(fromStr, toStr);
  if (r.error) return { error: r.error };

  const properties = await Property.find({ owner: ownerId }).select('_id title availabilityState openingTime closingTime');
  const ids = properties.map((p) => new mongoose.Types.ObjectId(p._id));

  const bookings = await Booking.find({
    facilityId: { $in: ids },
    date: { $gte: r.fromDate, $lte: r.toDate }
  }).sort({ date: 1, startTime: 1 });

  const logs = await EntryLog.find({
    owner: ownerId,
    logDate: { $gte: r.fromDate, $lte: r.toDate }
  }).sort({ logDate: 1 });

  const propertyUsage = computePropertyUsageHours(bookings, properties);

  const usageByCount = properties.map((p) => ({
    propertyId: p._id,
    title: p.title,
    bookings: bookings.filter((b) => b.facilityId?.toString() === p._id.toString()).length
  }));

  return {
    range: { from: r.fromDate, to: r.toDate },
    totals: {
      totalBookings: bookings.length,
      totalEntryLogs: logs.length
    },
    propertyUsage,
    usageByCount,
    bookings,
    entryLogs: logs
  };
}

//validation to generate reports
exports.getReportsSummary = async (req, res) => {
  try {
    const { from, to, type = 'all' } = req.query;
    const allowedTypes = ['all', 'entry_log', 'booking_details', 'property_usage'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid report type.' });
    }

    const data = await buildReportData(req.user.id, from, to, type);
    if (data.error) return res.status(400).json({ message: data.error });

    const base = {
      reportType: type,
      range: data.range
    };

    if (type === 'entry_log') {
      return res.status(200).json({
        ...base,
        entryLogs: data.entryLogs
      });
    }
    if (type === 'booking_details') {
      return res.status(200).json({
        ...base,
        bookings: data.bookings
      });
    }
    if (type === 'property_usage') {
      return res.status(200).json({
        ...base,
        propertyUsage: data.propertyUsage
      });
    }

    return res.status(200).json({
      reportType: 'all',
      range: data.range,
      totals: data.totals,
      propertyUsage: data.propertyUsage,
      usageByCount: data.usageByCount,
      bookings: data.bookings,
      entryLogs: data.entryLogs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/********************************************************************************************** */
exports.getReportsPdf = async (req, res) => {
  try {
    const { from, to, type = 'entry_log' } = req.query;
    const allowed = ['entry_log', 'booking_details', 'property_usage'];
    if (!allowed.includes(type)) {
      return res.status(400).json({ message: 'Invalid report type for PDF.' });
    }

    const data = await buildReportData(req.user.id, from, to, type);
    if (data.error) return res.status(400).json({ message: data.error });

    const fromDate = data.range.from;
    const toDate = data.range.to;

    if (type === 'entry_log') {
      const sections = [
        {
          heading: 'Summary',
          rows: [`Total entry records: ${data.entryLogs.length}`]
        },
        {
          heading: 'Entry log lines',
          table: {
            headers: ['Name', 'Type', 'Facility', 'Entry', 'Exit', 'ID OK'],
            data: data.entryLogs.map((l) => [
              l.name,
              l.type,
              l.facility,
              l.entryTime,
              l.exitTime || '-',
              l.idVerified ? 'Yes' : 'No'
            ])
          }
        }
      ];
      streamSecurityReportPdf(res, {
        reportType: 'entry-log',
        fromDate,
        toDate,
        title: 'Entry Log Report',
        sections
      });
      return;
    }

    if (type === 'booking_details') {
      const sections = [
        {
          heading: 'Summary',
          rows: [`Total bookings: ${data.bookings.length}`]
        },
        {
          heading: 'Bookings',
          table: {
            headers: ['Facility', 'Booked By', 'Date', 'Start', 'End', 'Status', 'Guests'],
            data: data.bookings.map((b) => [
              b.facilityName,
              b.userName,
              new Date(b.date).toLocaleDateString('en-CA'),
              b.startTime,
              b.endTime,
              b.status,
              b.guestCount != null ? String(b.guestCount) : '-'
            ])
          }
        }
      ];
      streamSecurityReportPdf(res, {
        reportType: 'booking-details',
        fromDate,
        toDate,
        title: 'Booking Details Report',
        sections
      });
      return;
    }

    if (type === 'property_usage') {
      const sections = [
        {
          heading: 'Summary',
          paragraph: 'Usage is summed from booking start/end times (hours) per property in the selected range. Cancelled bookings are excluded.'
        },
        {
          heading: 'Property usage (hours)',
          table: {
            headers: ['Property', 'Bookings', 'Total hours'],
            data: data.propertyUsage.map((u) => [
              u.title,
              String(u.bookingCount),
              String(u.totalHours)
            ])
          }
        }
      ];
      streamSecurityReportPdf(res, {
        reportType: 'property-usage',
        fromDate,
        toDate,
        title: 'Property Usage Report',
        sections
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
