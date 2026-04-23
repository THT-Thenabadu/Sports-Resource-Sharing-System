'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SecurityShell from './SecurityShell';

const cards = [
  { label: 'Availability', href: '/dashboard/security/availability' },
  { label: 'Upcoming Bookings', href: '/dashboard/security/upcoming-bookings' },
  { label: 'Current Bookings', href: '/dashboard/security/current-bookings' },
  { label: 'Entry Log', href: '/dashboard/security/entry-log' },
  { label: 'Reports', href: '/dashboard/security/reports' },
  { label: 'Booking Details', href: '/dashboard/security/booking-details' },
];

export default function SecurityDashboardPage() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const visibleCards = useMemo(() => {
    if (!q.trim()) return cards;
    const s = q.trim().toLowerCase();
    return cards.filter((c) => c.label.toLowerCase().includes(s));
  }, [q]);

  return (
    <SecurityShell>
      <div className="security-page-head">
        <h2>Welcome, Security Officer</h2>
        <p>Sports Property Security Management</p>
      </div>

      <section className="security-filter-bar">
        <h4>Quick filter</h4>
        <div className="security-filter-row">
          <div className="security-filter-field" style={{ flex: 1, maxWidth: '360px' }}>
            <label htmlFor="home-q">Find section</label>
            <input
              id="home-q"
              type="search"
              placeholder="e.g. booking, entry, report…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="security-filter-actions">
            <button type="button" className="secondary" onClick={() => setQ('')}>Clear</button>
          </div>
        </div>
      </section>

      <div className="security-cards">
        {visibleCards.map((item) => (
          <button
            key={item.href}
            type="button"
            className="security-card"
            onClick={() => router.push(item.href)}
          >
            <p>{item.label}</p>
          </button>
        ))}
      </div>
      {visibleCards.length === 0 && (
        <p style={{ margin: '0 30px', color: '#64748b' }}>No sections match your search.</p>
      )}
    </SecurityShell>
  );
}
