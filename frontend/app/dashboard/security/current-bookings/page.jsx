'use client';

import { useEffect, useMemo, useState } from 'react';
import SecurityShell from '../SecurityShell';

export default function CurrentBookingsPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8000/api/security/bookings?view=current', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((res) => setRows(Array.isArray(res) ? res : []))
      .catch(() => {});
  }, []);

  const displayRows = useMemo(() => {
    let list = rows;
    if (statusFilter !== 'all') {
      list = list.filter((b) => b.status === statusFilter);
    }
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.facilityName.toLowerCase().includes(s) ||
          b.userName.toLowerCase().includes(s)
      );
    }
    return list;
  }, [rows, q, statusFilter]);

  return (
    <SecurityShell>
      <div className="security-page-head">
        <h2>Current Bookings</h2>
        <p>Active bookings happening right now</p>
      </div>

      <section className="security-filter-bar">
        <h4>Filters</h4>
        <div className="security-filter-row">
          <div className="security-filter-field" style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="cur-q">Search facility / guest</label>
            <input
              id="cur-q"
              type="search"
              placeholder="Filter table…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="security-filter-field">
            <label htmlFor="cur-st">Status</label>
            <select id="cur-st" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All (checked in)</option>
              <option value="checkedin">Checked in</option>
            </select>
          </div>
          <div className="security-filter-actions">
            <button type="button" className="secondary" onClick={() => { setQ(''); setStatusFilter('all'); }}>
              Clear
            </button>
          </div>
        </div>
      </section>

      <div className="security-table-wrap">
        <h3>Active Now <span className="count-pill">{displayRows.length}</span></h3>
        <table className="security-table">
          <thead>
            <tr><th>Booking ID</th><th>Facility</th><th>Booked By</th><th>Time</th><th>Guests</th><th>Status</th></tr>
          </thead>
          <tbody>
            {displayRows.map((b) => (
              <tr key={b._id}>
                <td>{b._id.slice(-6)}</td>
                <td>{b.facilityName}</td>
                <td>{b.userName}</td>
                <td>{b.startTime} - {b.endTime}</td>
                <td>{b.guestCount ?? '-'}</td>
                <td><span className="status-pill ok">{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SecurityShell>
  );
}
