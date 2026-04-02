'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '../../component-styles/SecurityDashboard.css';

const navItems = [
  { label: 'Availability', href: '/dashboard/security/availability' },
  { label: 'Upcoming Bookings', href: '/dashboard/security/upcoming-bookings' },
  { label: 'Current Bookings', href: '/dashboard/security/current-bookings' },
  { label: 'Entry Log', href: '/dashboard/security/entry-log' },
  { label: 'Reports', href: '/dashboard/security/reports' },
  { label: 'Booking Details', href: '/dashboard/security/booking-details' },
];

export default function SecurityShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState('Owner');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (!token || !userRaw) {
      router.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      if (user.role !== 'owner') {
        router.replace('/');
        return;
      }
      setName(user.name || 'Owner');
    } catch {
      router.replace('/login');
    }
  }, [router]);

  return (
    <main className="security-layout">
      <aside className="security-sidebar">
        <div className="security-brand">
          <div>
            <h2>Security Panel</h2>
            <p>Sports Property</p>
          </div>
        </div>

        <p className="security-side-title">Management</p>
        <nav className="security-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`security-nav-item ${pathname === item.href ? 'security-nav-item--active' : ''}`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: '24px' }}>
          <Link
            href="/dashboard/security/scan"
            className={`security-nav-scan ${pathname === '/dashboard/security/scan' ? 'security-nav-scan--active' : ''}`}
          >
            <span>Scan Pass / Check-In</span>
          </Link>
        </div>
      </aside>

      <section className="security-content">
        <header className="security-topbar">
          <h1>Security Dashboard</h1>
          <div className="security-user">
            <span>{name}</span>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
