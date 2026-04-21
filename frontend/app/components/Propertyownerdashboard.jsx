'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import "../components/Propertyownerdashboard.css";

export default function PropertyOwnerDashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Sports');
  const [isBlockingModalOpen, setIsBlockingModalOpen] = useState(false);
  const [blockData, setBlockData] = useState({ facilityId: '', date: '', startTime: '', endTime: '' });

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

  const submitBlockSlot = async () => {
    if (!blockData.facilityId || !blockData.date || !blockData.startTime || !blockData.endTime) {
        return alert('Please fill in all fields to block a slot.');
    }
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8000/api/bookings/block`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(blockData)
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to block slot');
        }
        alert('Slot securely blocked globally.');
        setIsBlockingModalOpen(false);
        setBlockData({ facilityId: '', date: '', startTime: '', endTime: '' });
    } catch (err) {
        alert(err.message);
    }
  };

  return (
    <div className="pod-main">

      {/* Page Header */}
      <div className="pod-page-header">
        <div className="pod-page-header-left">
          <span className="pod-eyebrow">Elite Arena Management</span>
          <h1 className="pod-page-title">My Properties</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="pod-btn-primary"
            style={{ backgroundColor: '#dc2626' }}
            onClick={() => setIsBlockingModalOpen(true)}
          >
            <span className="material-symbols-outlined">block</span>
            <span>Block Time Slot</span>
          </button>
          <button
            className="pod-btn-primary"
            onClick={() => router.push('/properties/register')}
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>Add New Property</span>
          </button>
        </div>
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
                      Status:
                    </span>
                    <span className={`pod-card-status-dot ${property.status === 'active' ? 'pod-card-status-dot--active' : 'pod-card-status-dot--pending'}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Block Slot Modal */}
      {isBlockingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#112240]/40 backdrop-blur-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17, 34, 64, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-6 relative" style={{ backgroundColor: 'white', maxWidth: '32rem', width: '100%', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-inner" style={{ width: '3rem', height: '3rem', borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="text-2xl">🚫</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-[#112240]" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#112240' }}>Block a Time Slot</h3>
                        <p className="text-sm text-gray-500 font-medium" style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>Prevent customers from booking specific hours.</p>
                    </div>
                </div>

                <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Property</label>
                        <select
                            value={blockData.facilityId}
                            onChange={e => setBlockData({...blockData, facilityId: e.target.value})}
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 font-medium"
                            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.75rem', padding: '0.75rem', fontWeight: 500 }}
                        >
                            <option value="">-- Select a Property --</option>
                            {properties.map(p => (
                                <option key={p._id} value={p._id}>{p.title} ({p.city})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Date</label>
                        <input
                            type="date"
                            value={blockData.date}
                            onChange={e => setBlockData({...blockData, date: e.target.value})}
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 font-medium"
                            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.75rem', padding: '0.75rem', fontWeight: 500 }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Start Time</label>
                            <input
                                type="time"
                                value={blockData.startTime}
                                onChange={e => setBlockData({...blockData, startTime: e.target.value})}
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 font-medium"
                                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.75rem', padding: '0.75rem', fontWeight: 500 }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.375rem' }}>End Time</label>
                            <input
                                type="time"
                                value={blockData.endTime}
                                onChange={e => setBlockData({...blockData, endTime: e.target.value})}
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 font-medium"
                                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.75rem', padding: '0.75rem', fontWeight: 500 }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6' }}>
                    <button
                        onClick={() => setIsBlockingModalOpen(false)}
                        className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                        style={{ padding: '0.625rem 1.25rem', color: '#4b5563', fontWeight: 600, borderRadius: '0.75rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submitBlockSlot}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-colors"
                        style={{ padding: '0.625rem 1.5rem', backgroundColor: '#dc2626', color: 'white', fontWeight: 700, borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: 'none', cursor: 'pointer' }}
                    >
                        Block Slot
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}