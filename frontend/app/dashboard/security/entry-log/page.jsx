'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import SecurityShell from '../SecurityShell';
import { validateDateRange, todayIsoDate } from '@/app/utils/securityDateRange';

// ─── helpers ────────────────────────────────────────────────────────────────
const nowTime = () => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
};

const todayDisplay = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

const freshForm = () => ({
  name: '',
  type: 'Visitor',
  facility: '',
  entryTime: nowTime(),   // ← auto-filled, read-only
  idVerified: false,
});
// ────────────────────────────────────────────────────────────────────────────

export default function EntryLogPage() {
  const [rows, setRows] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState(freshForm);
  const [from, setFrom] = useState(() => todayIsoDate());
  const [to, setTo] = useState(() => todayIsoDate());
  const [typeFilter, setTypeFilter] = useState('all');
  const [q, setQ] = useState('');
  const [rangeError, setRangeError] = useState('');

  const loadLogs = useCallback(async () => {
    const err = validateDateRange(from, to);
    if (err) {
      setRangeError(err);
      return;
    }
    setRangeError('');
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ from, to });
    const res = await fetch(`http://localhost:8000/api/security/entry-logs?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
  }, [from, to]);

  const loadFacilities = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/security/availability', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.properties) setFacilities(data.properties);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadFacilities();
    loadLogs();
  }, [loadFacilities, loadLogs]);

  const displayRows = useMemo(() => {
    let list = rows;
    if (typeFilter !== 'all') list = list.filter((r) => r.type === typeFilter);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(s) || r.facility.toLowerCase().includes(s),
      );
    }
    return list;
  }, [rows, typeFilter, q]);

  const submit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await fetch('http://localhost:8000/api/security/entry-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setForm(freshForm());   // ← reset with a fresh auto-time
    loadLogs();
  };

  const markExit = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:8000/api/security/entry-logs/${id}/exit`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadLogs();
  };

  // Format logDate for display: show only the date portion
  const fmtDate = (raw) => {
    if (!raw) return '-';
    return new Date(raw).toLocaleDateString('en-CA'); // YYYY-MM-DD
  };

  return (
    <SecurityShell>
      <div className="security-page-head">
        <h2>Entry Log</h2>
        <p>Track all entries and exits at the property</p>
      </div>

      {/* ── Filters ── */}
      <section className="security-filter-bar">
        <h4>Log filters</h4>
        <div className="security-filter-row">
          <div className="security-filter-field">
            <label htmlFor="el-from">From</label>
            <input id="el-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="security-filter-field">
            <label htmlFor="el-to">To</label>
            <input id="el-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="security-filter-field">
            <label htmlFor="el-type">Type</label>
            <select id="el-type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="Visitor">Visitor</option>
              <option value="Member">Member</option>
              <option value="Service">Service</option>
            </select>
          </div>
          <div className="security-filter-field" style={{ flex: 1, minWidth: '160px' }}>
            <label htmlFor="el-q">Search name / facility</label>
            <input
              id="el-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter…"
            />
          </div>
          <div className="security-filter-actions">
            <button type="button" onClick={() => loadLogs()}>
              Apply range
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setFrom(todayIsoDate());
                setTo(todayIsoDate());
                setTypeFilter('all');
                setQ('');
              }}
            >
              Today
            </button>
          </div>
        </div>
        {rangeError && <p className="security-filter-error">{rangeError}</p>}
      </section>

      {/* ── Add Visitor form ── */}
      <form className="security-form" onSubmit={submit}>
        <h3>Add Visitor</h3>
        <div className="security-form-grid">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Visitor</option>
            <option>Member</option>
            <option>Service</option>
          </select>

          <select
            value={form.facility}
            onChange={(e) => setForm({ ...form, facility: e.target.value })}
            required
          >
            <option value="" disabled>
              Select Facility
            </option>
            {facilities.map((f) => (
              <option key={f._id} value={f.title}>
                {f.title}
              </option>
            ))}
          </select>

          {/* ── Auto-filled, read-only entry time ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label style={{ fontSize: '0.75rem', color: '#888' }}>
              Entry Time (auto)
            </label>
            <input
              value={form.entryTime}
              readOnly
              style={{ backgroundColor: '#f3f3f3', cursor: 'not-allowed', color: '#555' }}
              title="Entry time is set automatically"
            />
          </div>

          <label className="inline-check">
            <input
              type="checkbox"
              checked={form.idVerified}
              onChange={(e) => setForm({ ...form, idVerified: e.target.checked })}
            />{' '}
            ID Verified
          </label>
        </div>

        <button type="submit">Add Visitor</button>
      </form>

      {/* ── Table ── */}
      <div className="security-table-wrap">
        <h3>
          Log <span className="count-pill">{displayRows.length} entries</span>
        </h3>
        <table className="security-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>        {/* ← new column */}
              <th>Name</th>
              <th>Type</th>
              <th>Facility</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>ID Verified</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((r, i) => (
              <tr key={r._id}>
                <td>{i + 1}</td>
                <td>{fmtDate(r.logDate)}</td>   {/* ← date cell */}
                <td>{r.name}</td>
                <td>{r.type}</td>
                <td>{r.facility}</td>
                <td>{r.entryTime}</td>
                <td>
                  {r.exitTime ? (
                    r.exitTime
                  ) : (
                    <button
                      type="button"
                      onClick={() => markExit(r._id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.8rem',
                        backgroundColor: '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Mark Exit
                    </button>
                  )}
                </td>
                <td>
                  <span className={`status-pill ${r.idVerified ? 'ok' : 'bad'}`}>
                    {r.idVerified ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SecurityShell>
  );
}