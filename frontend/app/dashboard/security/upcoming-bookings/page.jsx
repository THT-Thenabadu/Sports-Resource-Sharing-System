'use client';

import { useEffect, useMemo, useState } from 'react';
import SecurityShell from '../SecurityShell';
import { validateDateRange } from '@/app/utils/securityDateRange';

export default function UpcomingBookingsPage() {
  const [rows, setRows] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8000/api/security/bookings?view=upcoming', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((res) => setRows(Array.isArray(res) ? res : []))
      .catch(() => {});
  }, []);

  const { displayRows, filterError } = useMemo(() => {
    if (from && to) {
      const v = validateDateRange(from, to);
      if (v) return { displayRows: [], filterError: v };
    } else if (from || to) {
      return { displayRows: [], filterError: 'Select both start and end date, or clear both fields.' };
    }

    let list = rows;
    if (from && to) {
      list = rows.filter((b) => {
        const d = new Date(b.date).toLocaleDateString('en-CA');
        return d >= from && d <= to;
      });
    }
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.facilityName.toLowerCase().includes(s) ||
          b.userName.toLowerCase().includes(s)
      );
    }
    return { displayRows: list, filterError: null };
  }, [rows, from, to, q]);

  return (
    <SecurityShell>
      <div className="security-page-head">
        <h2>Upcoming Bookings</h2>
        <p>Bookings scheduled for upcoming days</p>
      </div>

      <section className="security-filter-bar">
        <h4>Filters</h4>
        <div className="security-filter-row">
          <div className="security-filter-field">
            <label htmlFor="up-from">From</label>
            <input id="up-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="security-filter-field">
            <label htmlFor="up-to">To</label>
            <input id="up-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="security-filter-field" style={{ flex: 1, minWidth: '180px' }}>
            <label htmlFor="up-q">Search facility / guest</label>
            <input
              id="up-q"
              type="search"
              placeholder="Filter table…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="security-filter-actions">
            <button type="button" className="secondary" onClick={() => { setFrom(''); setTo(''); setQ(''); }}>
              Clear
            </button>
          </div>
        </div>
        {filterError && <p className="security-filter-error">{filterError}</p>}
      </section>

      <div className="security-table-wrap">
        <h3>Scheduled Bookings <span className="count-pill">{displayRows.length}</span></h3>
        <table className="security-table">
          <thead>
            <tr><th>Booking ID</th><th>Facility</th><th>Booked By</th><th>Date</th><th>Time</th><th>Guests</th></tr>
          </thead>
          <tbody>
            {displayRows.map((b) => (
              <tr key={b._id}>
                <td>{b._id.slice(-6)}</td>
                <td>{b.facilityName}</td>
                <td>{b.userName}</td>
                <td>{new Date(b.date).toLocaleDateString('en-CA')}</td>
                <td>{b.startTime} - {b.endTime}</td>
                <td>{b.guestCount ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SecurityShell>
  );
}
