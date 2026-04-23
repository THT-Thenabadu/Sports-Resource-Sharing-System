'use client';

import { useEffect, useMemo, useState } from 'react';
import SecurityShell from '../SecurityShell';
import { validateDateRange } from '@/app/utils/securityDateRange';

const statusOptions = ['pending', 'checkedin', 'checkedout'];

export default function BookingDetailsPage() {
  const [rows, setRows] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [q, setQ] = useState('');
  const [rangeError, setRangeError] = useState('');

  const loadRows = async (rangeOverride) => {
    const useFrom = rangeOverride?.from !== undefined ? rangeOverride.from : from;
    const useTo = rangeOverride?.to !== undefined ? rangeOverride.to : to;

    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ view: 'all' });
    if (useFrom && useTo) {
      const err = validateDateRange(useFrom, useTo);
      if (err) {
        setRangeError(err);
        return;
      }
      setRangeError('');
      params.set('from', useFrom);
      params.set('to', useTo);
    } else if (useFrom || useTo) {
      setRangeError('Select both start and end date, or clear both.');
      return;
    } else {
      setRangeError('');
    }

    const res = await fetch(`http://localhost:8000/api/security/bookings?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadRows();
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
  }, [rows, statusFilter, q]);

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:8000/api/security/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    loadRows();
  };

  const applyFilters = () => loadRows();

  return (
    <SecurityShell>
      <div className="security-page-head">
        <h2>Booking Details</h2>
        <p>View and update booking statuses</p>
      </div>

      <section className="security-filter-bar">
        <h4>Filters</h4>
        <div className="security-filter-row">
          <div className="security-filter-field">
            <label htmlFor="bd-from">From</label>
            <input id="bd-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="security-filter-field">
            <label htmlFor="bd-to">To</label>
            <input id="bd-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="security-filter-field">
            <label htmlFor="bd-st">Status</label>
            <select id="bd-st" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="security-filter-field" style={{ flex: 1, minWidth: '180px' }}>
            <label htmlFor="bd-q">Search</label>
            <input id="bd-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Facility / guest…" />
          </div>
          <div className="security-filter-actions">
            <button type="button" onClick={applyFilters}>Apply</button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setFrom('');
                setTo('');
                setStatusFilter('all');
                setQ('');
                setRangeError('');
                loadRows({ from: '', to: '' });
              }}
            >
              Reset
            </button>
          </div>
        </div>
        {rangeError && <p className="security-filter-error">{rangeError}</p>}
      </section>

      <div className="security-table-wrap">
        <h3>All Bookings <span className="count-pill">{displayRows.length}</span></h3>
        <table className="security-table">
          <thead>
            <tr><th>ID</th><th>Facility</th><th>Booked By</th><th>Date</th><th>Time</th><th>Status</th><th>Update Status</th></tr>
          </thead>
          <tbody>
            {displayRows.map((b) => (
              <tr key={b._id}>
                <td>{b._id.slice(-6)}</td>
                <td>{b.facilityName}</td>
                <td>{b.userName}</td>
                <td>{new Date(b.date).toLocaleDateString('en-CA')}</td>
                <td>{b.startTime} - {b.endTime}</td>
                <td><span className={`status-pill ${b.status === 'checkedout' ? 'muted' : 'ok'}`}>{b.status}</span></td>
                <td>
                  <select value={b.status} onChange={(e) => updateStatus(b._id, e.target.value)}>
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SecurityShell>
  );
}
