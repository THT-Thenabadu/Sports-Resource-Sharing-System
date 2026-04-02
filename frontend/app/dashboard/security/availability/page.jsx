'use client';

import { useEffect, useMemo, useState } from 'react';
import SecurityShell from '../SecurityShell';

export default function AvailabilityPage() {
  const [data, setData] = useState({ summary: { total: 0, available: 0, notAvailable: 0 }, properties: [] });
  const [search, setSearch] = useState('');
  const [availFilter, setAvailFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8000/api/security/availability', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch(() => {});
  }, []);

  const filteredProps = useMemo(() => {
    let list = data.properties || [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (availFilter === 'available') {
      list = list.filter((p) => (p.availabilityState || 'available') === 'available');
    }
    if (availFilter === 'not_available') {
      list = list.filter((p) => (p.availabilityState || 'available') === 'not_available');
    }
    return list;
  }, [data.properties, search, availFilter]);

  return (
    <SecurityShell>
      <div className="security-page-head">
        <h2>Facility Availability</h2>
        <p>Real-time status of all sports facilities</p>
      </div>

      <section className="security-filter-bar">
        <h4>Filters</h4>
        <div className="security-filter-row">
          <div className="security-filter-field">
            <label htmlFor="av-search">Search facility</label>
            <input
              id="av-search"
              type="search"
              placeholder="Name contains…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="security-filter-field">
            <label htmlFor="av-state">Availability</label>
            <select id="av-state" value={availFilter} onChange={(e) => setAvailFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="not_available">Not available</option>
            </select>
          </div>
        </div>
      </section>

      <div className="security-cards">
        <article className="security-card"><p>Total Facilities: {data.summary.total || 0}</p></article>
        <article className="security-card"><p>Available: {data.summary.available || 0}</p></article>
        <article className="security-card"><p>Not Available: {data.summary.notAvailable || 0}</p></article>
      </div>

      <div className="security-cards security-cards-spaced">
        {filteredProps.map((p) => (
          <article key={p._id} className="security-card security-property-card">
            <p>{p.title}</p>
            <span className={`status-pill ${(p.availabilityState || 'available') === 'available' ? 'ok' : 'bad'}`}>
              {(p.availabilityState || 'available') === 'available' ? 'Available' : 'Occupied'}
            </span>
            <small>{p.openingTime || '06:00'} - {p.closingTime || '22:00'}</small>
          </article>
        ))}
        {filteredProps.length === 0 && (
          <p style={{ gridColumn: '1 / -1', color: '#64748b', padding: '8px 0' }}>No facilities match your filters.</p>
        )}
      </div>
    </SecurityShell>
  );
}
