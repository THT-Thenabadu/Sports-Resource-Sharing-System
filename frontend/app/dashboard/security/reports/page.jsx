'use client';

import { useMemo, useState } from 'react';
import SecurityShell from '../SecurityShell';
import { validateDateRange, daysAgoIsoDate, todayIsoDate } from '@/app/utils/securityDateRange';

const REPORT_TYPES = [
  { value: 'all', label: 'Full summary (all)' },
  { value: 'entry_log', label: 'Entry log report' },
  { value: 'booking_details', label: 'Booking details report' },
  { value: 'property_usage', label: 'Property usage (hours)' }
];

export default function ReportsPage() {
  const [from, setFrom] = useState(() => daysAgoIsoDate(7));
  const [to, setTo] = useState(() => todayIsoDate());
  const [reportType, setReportType] = useState('all');
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => validateDateRange(from, to) === null, [from, to]);

  const generate = async () => {
    const v = validateDateRange(from, to);
    if (v) {
      setError(v);
      setReport(null);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const qs = new URLSearchParams({ from, to, type: reportType });
      const res = await fetch(`http://localhost:8000/api/security/reports/summary?${qs}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to load report.');
        setReport(null);
        return;
      }
      setReport(data);
    } catch {
      setError('Could not reach server.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    const v = validateDateRange(from, to);
    if (v) {
      setError(v);
      return;
    }
    if (reportType === 'all') {
      setError('Choose a specific report type to download as PDF (entry log, booking details, or property usage).');
      return;
    }
    setError('');
    try {
      const token = localStorage.getItem('token');
      const qs = new URLSearchParams({ from, to, type: reportType });
      const res = await fetch(`http://localhost:8000/api/security/reports/pdf?${qs}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const err = await res.json().catch(() => ({}));
        setError(err.message || 'PDF download failed.');
        return;
      }
      if (!res.ok) {
        setError('PDF download failed.');
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition');
      let name = 'report.pdf';
      if (cd && cd.includes('filename=')) {
        const m = cd.match(/filename="([^"]+)"/);
        if (m) name = m[1];
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Could not download PDF.');
    }
  };

  return (
    <SecurityShell>
      <div className="security-page-head">
        <h2>Report Generation</h2>
        <p>Generate and review security and booking reports</p>
      </div>

      <section className="security-filter-bar">
        <h4>Filters</h4>
        <div className="security-filter-row">
          <div className="security-filter-field">
            <label htmlFor="rep-type">Report type</label>
            <select
              id="rep-type"
              value={reportType}
              onChange={(e) => { setReportType(e.target.value); setReport(null); }}
            >
              {REPORT_TYPES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="security-filter-field">
            <label htmlFor="rep-from">From</label>
            <input id="rep-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="security-filter-field">
            <label htmlFor="rep-to">To</label>
            <input id="rep-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="security-filter-actions">
            <button type="button" className="secondary" onClick={() => { setFrom(daysAgoIsoDate(7)); setTo(todayIsoDate()); }}>
              Last 7 days
            </button>
            <button type="button" disabled={!canSubmit || loading} onClick={generate}>
              {loading ? 'Loading…' : 'Generate & view'}
            </button>
            <button type="button" disabled={!canSubmit || reportType === 'all'} onClick={downloadPdf}>
              Download PDF
            </button>
          </div>
        </div>
        {error && <p className="security-filter-error">{error}</p>}
      </section>

      {report && (
        <section className="security-table-wrap">
          <h3>Report preview</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Period: {report.range?.from && new Date(report.range.from).toISOString().slice(0, 10)} —{' '}
            {report.range?.to && new Date(report.range.to).toISOString().slice(0, 10)}
          </p>

          {reportType === 'all' && report.totals &&
            report.totals.totalBookings === 0 && report.totals.totalEntryLogs === 0 && (
            <p style={{ color: '#64748b' }}>No bookings or entry logs in this date range.</p>
          )}

          {report.entryLogs && report.entryLogs.length > 0 && (
            <>
              <h4>Entry logs ({report.entryLogs.length})</h4>
              <table className="security-table">
                <thead>
                  <tr><th>Name</th><th>Type</th><th>Facility</th><th>Entry</th><th>Exit</th></tr>
                </thead>
                <tbody>
                  {report.entryLogs.slice(0, 50).map((l) => (
                    <tr key={l._id}>
                      <td>{l.name}</td><td>{l.type}</td><td>{l.facility}</td><td>{l.entryTime}</td><td>{l.exitTime || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.entryLogs.length > 50 && <p>Showing first 50 rows.</p>}
            </>
          )}

          {report.bookings && report.bookings.length > 0 && (
            <>
              <h4>Bookings ({report.bookings.length})</h4>
              <table className="security-table">
                <thead>
                  <tr><th>Facility</th><th>Booked by</th><th>Date</th><th>Time</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {report.bookings.slice(0, 50).map((b) => (
                    <tr key={b._id}>
                      <td>{b.facilityName}</td>
                      <td>{b.userName}</td>
                      <td>{new Date(b.date).toLocaleDateString('en-CA')}</td>
                      <td>{b.startTime} – {b.endTime}</td>
                      <td>{b.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.bookings.length > 50 && <p>Showing first 50 rows.</p>}
            </>
          )}

          {report.propertyUsage && report.propertyUsage.length > 0 && (
            <>
              <h4>Property usage (booked hours)</h4>
              <p style={{ fontSize: '0.88rem', color: '#475569' }}>
                Hours are calculated from each booking&apos;s start and end time. Cancelled bookings are excluded.
              </p>
              <table className="security-table">
                <thead>
                  <tr><th>Property</th><th>Bookings</th><th>Total hours</th></tr>
                </thead>
                <tbody>
                  {report.propertyUsage.map((u) => (
                    <tr key={String(u.propertyId)}>
                      <td>{u.title}</td>
                      <td>{u.bookingCount}</td>
                      <td>{u.totalHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {reportType === 'all' && report.totals && (
            <p style={{ marginTop: '12px' }}>
              <strong>Totals:</strong> {report.totals.totalBookings} bookings · {report.totals.totalEntryLogs} entry logs
            </p>
          )}
        </section>
      )}
    </SecurityShell>
  );
}
