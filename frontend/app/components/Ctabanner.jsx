'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import '../component-styles/Ctabanner.css';

const arenas = [
  {
    id: 1,
    name: 'Grand Central Pitch',
    price: 45,
    location: 'Downtown Sports Hub',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc1_2DxD3_sUb-RxEaF9u0-xh7O8OjfCgvWNAlVquNtFqUQjTcBmKVAUUqLG9rRvheZaZUo6cB4NBpsjTwkIKmU58SSWSDQxd7CKyCVC6T2rZVUYDt9PfJlHmpm5g1_gYz-igTsFZvPaG-nowlu-Rk282p2ZTQU97coVIVGVTsQuI3Jn3K-seO3OZZr7UQNsdCZDtwAZAb2EDcmFb30JeaMojb1ZHaSsquXwX60mBtvRDKZ3ZkT_JfHSKcnOL-kAWsYJtbYLzxXAQ',
    verified: true,
  },
  {
    id: 2,
    name: 'Skyline Tennis Academy',
    price: 60,
    location: 'North Wing Plaza',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5sVFuETOOxOaM4Di6w_lCcEjRTGwEKcAbDT8e5pDW7rro6U0nLatDKrkYKTFucd0ewYUiAQJiLElXlHXVIUcCyTofsR_kMhx3TeCADFsUdKWMFxOZ5kTi4x7W6MtR2vfpQ0ffQEvqdw4wvEKGGacMHzDrdbc5ORasB4cw10NPjxISbYB_vhLtB_OswkdTSHDrC6gF2bgoM0W6E9ovzSdQeLH7USoYksLmTLAGbIdfQbq59h7r4ppOnyBl6NhaJGgBovyp3Wb06iY',
    verified: true,
  },
  {
    id: 3,
    name: 'The Hoop Sanctuary',
    price: 40,
    location: 'West End Precinct',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqKiFW_xsCewhJGqWOhAsvppp8hfpmOzBbUWNbrP_HlmV13KQasITk7JnuJXqOmniT6kCXAS1KM3wkod-OZ76qHBpPGI74ObBZCjUrbStEctxVeFzxgE_umf4gBe76OWm9ZTukHh2naBMplSedFVLgk_VuKC7ejqWb9SnlJ1Xh3Z4b0zZ1pmWTWgq8vTH-so14qSOvoPpk4LX1xCrxQwOU21Wux-EhdzZ2YVdSZsENhYYpODe6id-DN5rrxcMi8jiCG_Cy-FsmjZ0',
    verified: true,
  },
];

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
    href: '#',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE4iVcupSDXW0yha63kVzx9mJLunmr43ddljgVyiyIYcwQ63HNGGEeBFDhUxcL9dck6OKDPcYek-lvcKibDXadIOrTwtz6b4fMedxzXMVBGHMTkx11yUlxmS-vC93PsEZCTHINq1GyTeHR5yjUKg18XQ-oRUngXATtwY-veis2Vlk4-ythhZCJgQRQQbM-dxStRE803SP7c7nntbcr7awnvzEEXRT_O-3YBcbt_oWD07rCfzXtrR3CkZdmZ9-kOXX64SDYLRpL8Hs',
  },
];

export default function Ctabanner() {
  return (
    <>
      {/* ─── Arena Cards Section ─────────────────────── */}
      <section className="arenas-section">
        <div className="arenas-container">
          <div className="arenas-header">
            <h2 className="arenas-title">Sports Properties</h2>
            <button className="arenas-view-all">
              View All Arenas
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          <div className="arenas-grid">
            {arenas.map((arena) => (
              <div key={arena.id} className="arena-card">
                <div className="arena-image-wrapper">
                  <img
                    src={arena.image}
                    alt={arena.name}
                    className="arena-image"
                  />
                  {arena.verified && (
                    <div className="arena-verified-badge">
                      <span
                        className="material-symbols-outlined arena-verified-icon"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      <span className="arena-verified-text">Verified</span>
                    </div>
                  )}
                </div>

                <div className="arena-content">
                  <div className="arena-info-row">
                    <h3 className="arena-name">{arena.name}</h3>
                    <div className="arena-price">
                      ${arena.price}
                      <span className="arena-price-unit">/hr</span>
                    </div>
                  </div>
                  <div className="arena-location">
                    <span className="material-symbols-outlined arena-location-icon">location_on</span>
                    {arena.location}
                  </div>
                  <div className="arena-actions">
                    <button className="arena-book-btn">Book Now</button>
                    <button className="arena-fav-btn">
                      <span className="material-symbols-outlined">favorite</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner Section ───────────────────────── */}
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
    </>
  );
}