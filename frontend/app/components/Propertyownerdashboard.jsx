'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import "../components/Propertyownerdashboard.css";

export default function PropertyOwnerDashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Sports');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/properties/my-properties', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setProperties(data);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const sportTypes = ['All Sports', ...new Set(properties.map(p => p.sportType))];

  const filtered = filter === 'All Sports'
    ? properties
    : properties.filter(p => p.sportType === filter);

  const getStatusBadge = (status) => {
    if (status === 'active') return <span className="pod-badge pod-badge--active">Active</span>;
    if (status === 'inactive') return <span className="pod-badge pod-badge--inactive">Inactive</span>;
    return <span className="pod-badge pod-badge--pending">Pending Review</span>;
  };

  return (
    <div className="pod-main">

      {/* Page Header */}
      <div className="pod-page-header">
        <div className="pod-page-header-left">
          <span className="pod-eyebrow">Elite Arena Management</span>
          <h1 className="pod-page-title">My Properties</h1>
        </div>
        <button
          className="pod-btn-primary"
          onClick={() => router.push('/properties/register')}
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span>Add New Property</span>
        </button>
      </div>

      {/* Stats + Filter Bar */}
      <div className="pod-stats-bar">
        <div className="pod-stat-box">
          <p className="pod-stat-label">Total Facilities</p>
          <p className="pod-stat-number">{properties.length}</p>
        </div>
        <div className="pod-filter-row">
          <span className="pod-filter-label">Filter By:</span>
          {sportTypes.map(sport => (
            <button
              key={sport}
              className={`pod-filter-btn ${filter === sport ? 'pod-filter-btn--active' : ''}`}
              onClick={() => setFilter(sport)}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="pod-loading">
          <span className="material-symbols-outlined pod-loading-icon">autorenew</span>
          <p>Loading your properties...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && properties.length === 0 && (
        <div className="pod-empty-container">
          <div className="pod-empty-gradient pod-empty-gradient--left" />
          <div className="pod-empty-gradient pod-empty-gradient--right" />
          <div className="pod-empty-content">
            <div className="pod-empty-card-wrap">
              <div className="pod-empty-card">
                <div className="pod-illustration">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmtccPYc3xAda7cBsbRWxYphnk9IknOHh5F5Cc5TK4TL9UoJREe9Lrr5sVOIEF-pBvmI8Ih-amH-NcHQN3R6c_Rl_mYqZ18CAZNH_dy-HOgBYaWxy122TiI6qfSIH6agjtN20_MRwoxr5usQK4bPxD4xu6U991eyhIu6cf5B8-4CI91Nih7Crc8P3KkdaLpDFAXwfxWVzjdy36O73oKsLDKdbAnyg0BKkA9GheD4IGr9n4KkuSNlnl3R1yNt3NShigRvZAhMVQABw"
                    alt="Empty stadium"
                    className="pod-illustration-img"
                  />
                  <div className="pod-illustration-icon-wrap">
                    <span className="material-symbols-outlined pod-illustration-icon">stadium</span>
                  </div>
                  <div className="pod-verified-badge">
                    <span className="material-symbols-outlined pod-verified-icon">verified</span>
                    <span className="pod-verified-label">Elite Arena</span>
                  </div>
                </div>
                <div className="pod-empty-text">
                  <h2 className="pod-empty-heading">No properties registered yet</h2>
                  <p className="pod-empty-description">
                    Start your journey in the Elite Arena. Listing your sports facility gives you
                    access to professional booking management and advanced performance analytics.
                  </p>
                </div>
                <div className="pod-empty-cta">
                  <button
                    className="pod-btn-primary pod-btn-primary--lg"
                    onClick={() => router.push('/properties/register')}
                  >
                    <span>Register your first property</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
                <div className="pod-trust-badges">
                  <div className="pod-trust-badge">
                    <span className="material-symbols-outlined pod-trust-icon">bolt</span>
                    <span className="pod-trust-label">Fast Approval</span>
                  </div>
                  <div className="pod-trust-badge">
                    <span className="material-symbols-outlined pod-trust-icon">support_agent</span>
                    <span className="pod-trust-label">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {!loading && properties.length > 0 && (
        <div className="pod-grid">
          {filtered.map(property => (
            <div key={property._id} className="pod-card">
              {/* Image */}
              <div className="pod-card-img-wrap">
                {property.images?.[0] ? (
                  <img
                    src={`http://localhost:8000${property.images[0]}`}
                    alt={property.title}
                    className="pod-card-img"
                  />
                ) : (
                  <div className="pod-card-img-placeholder">
                    <span className="material-symbols-outlined">image_not_supported</span>
                  </div>
                )}
                <div className="pod-card-badges">
                  {property.status === 'active' && (
                    <span className="pod-badge pod-badge--verified">
                      <span className="material-symbols-outlined">verified</span>
                      Verified
                    </span>
                  )}
                  {getStatusBadge(property.status)}
                </div>
              </div>

              {/* Content */}
              <div className="pod-card-body">
                <div className="pod-card-top">
                  <div>
                    <span className="pod-card-sport">
                      {property.sportType} • {property.propertyType}
                    </span>
                    <h3 className="pod-card-title">{property.title}</h3>
                  </div>
                  <div className="pod-card-price">
                    ${property.pricePerHour}
                    <span className="pod-card-price-unit">/hr</span>
                  </div>
                </div>

                <div className="pod-card-location">
                  <span className="material-symbols-outlined">location_on</span>
                  {property.city}
                </div>

                <div className="pod-card-footer">
                  <button
                    className="pod-card-edit-btn"
                    onClick={() => router.push(`/properties/edit/${property._id}`)}
                  >
                    <span className="material-symbols-outlined">edit</span>
                    Edit
                  </button>
                  <div className="pod-card-status-row">
                    <span className="pod-card-status-label">
                      {property.status === 'active' ? 'Live' : 'Offline'}
                    </span>
                    <div className={`pod-toggle ${property.status === 'active' ? 'pod-toggle--on' : ''}`}>
                      <div className="pod-toggle-thumb" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <div
            className="pod-card-add"
            onClick={() => router.push('/properties/register')}
          >
            <div className="pod-card-add-icon">
              <span className="material-symbols-outlined">add_business</span>
            </div>
            <h3 className="pod-card-add-title">Expand Your Portfolio</h3>
            <p className="pod-card-add-desc">
              Add a new court, field, or arena to your Sportek management profile.
            </p>
            <span className="pod-card-add-cta">Get Started Now</span>
          </div>
        </div>
      )}

      {/* Help Section */}
      <section className="pod-help-section">
        <div className="pod-help-text">
          <h3 className="pod-help-heading">Need help getting started?</h3>
          <p className="pod-help-body">
            Our onboarding specialists are ready to help you digitize your facility. From court
            mapping to dynamic pricing structures, we've got you covered.
          </p>
          <div className="pod-help-links">
            <a href="#" className="pod-help-link">
              <span>Read the Owner Guide</span>
              <span className="material-symbols-outlined pod-help-link-icon">menu_book</span>
            </a>
            <a href="#" className="pod-help-link">
              <span>Schedule an Onboarding Call</span>
              <span className="material-symbols-outlined pod-help-link-icon">calendar_today</span>
            </a>
          </div>
        </div>
        <div className="pod-help-media">
          <div className="pod-help-video-wrap">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhd5VgQnGE0J67iJEYKzmJUZ7jd5_4c5_dYtqlrm_njpQ1-L1Evoc2Scv4h8Ss8-TPWotLtORNadweU3HH1IwPiO6D46Ck0nKcVhmOxcJjm2pAd9V3N5--gh5AeR_ya3lZjoKgS0f1-kGBGxgba5Pp-P7bNMuhWKq2kMvqPE7yQOst0wSUNE8Sn3jat4gAJN4B-VteJjqoQvOaBGhZVE7K_lEtu97x7n-Vfz47uMjBm7Ia_j54sS9xw5CuyqcKWvaClkAkK8v2fRs"
              alt="Sports management dashboard"
              className="pod-help-video-img"
            />
            <div className="pod-help-video-overlay">
              <div className="pod-play-btn">
                <span className="material-symbols-outlined pod-play-icon">play_arrow</span>
              </div>
            </div>
            <div className="pod-help-video-caption">
              <p className="pod-caption-label">Tutorial</p>
              <p className="pod-caption-text">Watch: How to list your arena in 5 minutes</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}