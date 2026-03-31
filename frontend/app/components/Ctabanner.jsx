'use client';
import React from 'react';
import Link from 'next/link';
import '../component-styles/Ctabanner.css';

const ctas = [
  {
    label: 'Explore Facilities',
    alt: 'Explore',
    href: '/booking',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTzF6-AndGeFFp1BFKRAjYZMgSrEK-n0p8CpMSBR7adC2_fUdsW0MVWfq3EgQJkNPa35WtWS3wUtFr-cVsRdEZM0TBvcP4onJnRE4NsEYrjgHNGzHWJoS8AOAgtGgdCsQeeyU2uW4yXA38IWujct4lBf_HyalVbh5L0uQ8-KmZuJ1qZ1gUaMv3IJrEUEWQZA1ShJ22ZW6iwL5qRiuEhcRZm37vGuuW2AqWzEpaNdc7kfladdLA3MO8mytxXmRF2e29TxRdeUEVXN0',
  },
  {
    label: 'List Your Property',
    alt: 'List',
    href: '#', // You can change this later
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE4iVcupSDXW0yha63kVzx9mJLunmr43ddljgVyiyIYcwQ63HNGGEeBFDhUxcL9dck6OKDPcYek-lvcKibDXadIOrTwtz6b4fMedxzXMVBGHMTkx11yUlxmS-vC93PsEZCTHINq1GyTeHR5yjUKg18XQ-oRUngXATtwY-veis2Vlk4-ythhZCJgQRQQbM-dxStRE803SP7c7nntbcr7awnvzEEXRT_O-3YBcbt_oWD07rCfzXtrR3CkZdmZ9-kOXX64SDYLRpL8Hs',
  },
];

const CTABanner = () => {
  return (
    <section className="cta-banner" data-purpose="primary-actions">
      <div className="cta-grid">
        {ctas.map((cta, index) => (
          <Link key={index} href={cta.href} className="cta-card">
            <div className="cta-bg-wrap">
              <img src={cta.img} alt={cta.alt} className="cta-bg-img" />
            </div>
            <div className="cta-btn">{cta.label}</div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CTABanner;