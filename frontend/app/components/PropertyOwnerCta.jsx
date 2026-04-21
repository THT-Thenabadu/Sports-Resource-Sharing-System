'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '../component-styles/PropertyOwnerCta.css';

export default function PropertyOwnerCta() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'customer') {
      setShow(true);
    }
  }, []);

  // ✅ Don't render anything if not a customer
  if (!show) return null;

  return (
    <section className="owner-cta-section">
      {/* Background Image + Overlay */}
      <div className="owner-cta-bg">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTzF6-AndGeFFp1BFKRAjYZMgSrEK-n0p8CpMSBR7adC2_fUdsW0MVWfq3EgQJkNPa35WtWS3wUtFr-cVsRdEZM0TBvcP4onJnRE4NsEYrjgHNGzHWJoS8AOAgtGgdCsQeeyU2uW4yXA38IWujct4lBf_HyalVbh5L0uQ8-KmZuJ1qZ1gUaMv3IJrEUEWQZA1ShJ22ZW6iwL5qRiuEhcRZm37vGuuW2AqWzEpaNdc7kfladdLA3MO8mytxXmRF2e29TxRdeUEVXN0"
          alt="Elite Stadium Arena"
          className="owner-cta-bg-img"
        />
        <div className="owner-cta-overlay" />
      </div>

      {/* Content */}
      <div className="owner-cta-container">
        <div className="owner-cta-content">
          <h2 className="owner-cta-title">
            List Your Arena.<br />Join as an Owner.
          </h2>
          <p className="owner-cta-description">
            Turn your unused sports infrastructure into a revenue stream. Reach thousands
            of athletes looking for professional-grade venues and gear in your area.
          </p>
          <div className="owner-cta-actions">
            <button className="owner-cta-btn-primary"
            onClick={() => router.push('/become-owner')}
            >Get Started</button>
            <button className="owner-cta-btn-secondary">Learn More</button>
          </div>
        </div>
      </div>
    </section>
  );
}