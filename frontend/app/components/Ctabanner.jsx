'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../component-styles/Ctabanner.css';

const fallbackArenas = [
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

export default function Ctabanner() {
  const [arenas, setArenas] = useState(fallbackArenas);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8000/api/properties')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const mapped = data.slice(0, 6).map(p => {
            const displayLocation = [p.city, p.address].filter(Boolean).join(' - ');
            const imageUrl = p.images && p.images.length > 0
              ? `http://localhost:8000${p.images[0]}`
              : fallbackArenas[0].image; // default image fallback
            return {
              id: p._id,
              name: p.title,
              price: p.pricePerHour,
              location: displayLocation || 'Location TBD',
              image: imageUrl,
              verified: true
            };
          });
          setArenas(mapped);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch properties:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="arenas-section">
      <div className="arenas-container">

        {/* Section Header */}
        <div className="arenas-header">
          <h2 className="arenas-title">Sports Properties</h2>
          <button className="arenas-view-all">
            View All Arenas
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        {/* Arena Cards Grid */}
        <div className="arenas-grid">
          {arenas.map((arena) => (
            <div key={arena.id} className="arena-card">

              {/* Image */}
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

              {/* Content */}
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
                  <button onClick={() => router.push(`/property/${arena.id}`)} className="arena-book-btn">Book Now</button>
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
  );
}