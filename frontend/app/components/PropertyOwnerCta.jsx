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
          src="https://images.unsplash.com/photo-1540747913346-19e32fc3e666"
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