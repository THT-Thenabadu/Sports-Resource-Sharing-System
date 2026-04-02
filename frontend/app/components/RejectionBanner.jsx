'use client';
import { useEffect, useState } from 'react';
import '../component-styles/RejectionBanner.css';

export default function RejectionBanner() {
  const [status, setStatus] = useState(null); // 'rejected' | 'pending' | null
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Only check for customers — owners and admins don't need this
      if (!token || user.role === 'owner' || user.role === 'admin') return;

      try {
        const res = await fetch('http://localhost:8000/api/owner-application/my-status', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return; // no application found, that's fine

        const data = await res.json();

        // Check if user already dismissed this banner this session
        const dismissedKey = `banner-dismissed-${data._id}`;
        if (sessionStorage.getItem(dismissedKey)) return;

        setStatus(data.status);
      } catch (err) {
        // silently fail — this is a non-critical UI feature
      }
    };

    checkApplicationStatus();
  }, []);

  const handleDismiss = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/owner-application/my-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      sessionStorage.setItem(`banner-dismissed-${data._id}`, 'true');
    } catch {}
    setDismissed(true);
  };

  if (dismissed || !status) return null;

  // Only show banner for rejected or pending
  if (status === 'rejected') {
    return (
      <div className="rej-banner rej-banner--rejected">
        <div className="rej-banner-left">
          <span className="material-symbols-outlined rej-banner-icon">cancel</span>
          <div>
            <p className="rej-banner-title">Your owner application was not approved</p>
            <p className="rej-banner-desc">
              Unfortunately your application to become a property owner was rejected by our team.
              Please review your details and feel free to reapply with updated information.
            </p>
          </div>
        </div>
        <div className="rej-banner-actions">
          <a href="/become-owner" className="rej-banner-btn">
            <span className="material-symbols-outlined">refresh</span>
            Reapply
          </a>
          <button className="rej-banner-close" onClick={handleDismiss}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="rej-banner rej-banner--pending">
        <div className="rej-banner-left">
          <span className="material-symbols-outlined rej-banner-icon">hourglass_top</span>
          <div>
            <p className="rej-banner-title">Your owner application is under review</p>
            <p className="rej-banner-desc">
              Our team is reviewing your application. You'll be upgraded to a property owner
              account once approved — usually within 24 hours.
            </p>
          </div>
        </div>
        <div className="rej-banner-actions">
          <button className="rej-banner-close" onClick={handleDismiss}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}