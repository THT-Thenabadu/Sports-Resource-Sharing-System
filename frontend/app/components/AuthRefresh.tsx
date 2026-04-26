'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AuthRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    const refreshRole = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:8000/api/auth/refresh-token', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) return;

        // Update localStorage with fresh token and role
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          name: data.name,
          role: data.role
        }));

        const redirectOwnerFrom = ['/', '/login', '/register', '/become-owner'];
        if (data.role === 'owner' && redirectOwnerFrom.includes(pathname)) {
            window.location.href = '/propertyowner';
          }

        // If somehow a non-owner hits /propertyowner, kick them out
        if (data.role !== 'owner' && pathname.startsWith('/propertyowner')) {
          window.location.href = '/';
        }

      } catch (err) {
        console.error('Token refresh failed:', err);
      }
    };

    refreshRole();
  }, [pathname]); // runs on every page navigation

  return null; // renders nothing
}