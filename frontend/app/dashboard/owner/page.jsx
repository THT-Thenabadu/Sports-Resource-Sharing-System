'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../component-styles/OwnerDashboard.css';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState('');
  const [properties, setProperties] = useState([]);
  const [securityCreds, setSecurityCreds] = useState(null);
  const [securityForm, setSecurityForm] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityMessage, setSecurityMessage] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availabilityUpdatingId, setAvailabilityUpdatingId] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      router.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      // Only accepted owners get role=owner from backend approval flow.
      if (user.role !== 'owner') {
        router.replace('/');
        return;
      }

      setOwnerName(user.name || 'Owner');
      fetchOwnerProfile(token);
      fetchMyProperties(token);
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.replace('/login');
    }
  }, [router]);

  const fetchMyProperties = async (token) => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('http://localhost:8000/api/properties/my-properties', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load properties');
      }

      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not load your properties.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerProfile = async (token) => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) return;
      const data = await res.json();
      if (data?.securityUsername && data?.securityPasswordPlain) {
        setSecurityCreds({
          username: data.securityUsername,
          password: data.securityPasswordPlain
        });
        setSecurityForm((prev) => ({
          ...prev,
          username: data.securityUsername
        }));
      }
    } catch (err) {
      // Keep dashboard usable even if profile request fails.
    }
  };

  const handleSecurityFormChange = (e) => {
    const { name, value } = e.target;
    setSecurityForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    setSecurityMessage('');
    setSecurityError('');

    if (!securityForm.username || !securityForm.password || !securityForm.confirmPassword) {
      setSecurityError('Please fill in username, password, and confirm password.');
      return;
    }

    if (securityForm.password !== securityForm.confirmPassword) {
      setSecurityError('Security password and confirm password do not match.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setSecurityError('You are not logged in. Please login again.');
      return;
    }

    try {
      setSecuritySaving(true);
      const res = await fetch('http://localhost:8000/api/auth/security-credentials', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          securityUsername: securityForm.username,
          securityPassword: securityForm.password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update security credentials.');
      }

      setSecurityCreds({
        username: data.securityUsername,
        password: data.securityPasswordPlain
      });
      setSecurityMessage(data.message || 'Updated successfully.');
      setSecurityForm((prev) => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setSecurityError(err.message || 'Failed to update security credentials.');
    } finally {
      setSecuritySaving(false);
    }
  };

  const toggleAvailability = async (property) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const nextState = property.availabilityState === 'available' ? 'not_available' : 'available';
    try {
      setAvailabilityUpdatingId(property._id);
      const res = await fetch(`http://localhost:8000/api/properties/${property._id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ availabilityState: nextState })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update availability.');

      setProperties((prev) =>
        prev.map((item) =>
          item._id === property._id
            ? { ...item, availabilityState: data.property.availabilityState }
            : item
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to update availability.');
    } finally {
      setAvailabilityUpdatingId('');
    }
  };

  return (
    <main className="owner-dashboard-page">
      <section className="owner-dashboard-card">
        <h1 className="owner-dashboard-title">Owner Dashboard</h1>
        <p className="owner-dashboard-subtitle">Welcome back, {ownerName}.</p>

        <div className="owner-dashboard-grid">
          <div className="owner-dashboard-widget">
            <h2>Property Management</h2>
            <p>Add and manage your sports facilities from one place.</p>
            <button
              type="button"
              className="owner-dashboard-btn"
              onClick={() => router.push('/properties/register')}
            >
              Add New Property
            </button>
          </div>

          <div className="owner-dashboard-widget">
            <h2>Listing Status</h2>
            <p>Submitted properties appear below with their current review status.</p>
          </div>

          <div className="owner-dashboard-widget">
            <h2>Quick Tip</h2>
            <p>Complete your property details to attract more bookings.</p>
          </div>
        </div>

        <section className="owner-security-section">
          <h2 className="owner-properties-title">Security Dashboard Credentials</h2>
          {securityCreds ? (
            <div className="owner-security-card">
              <p className="owner-security-note">
                Use these credentials on the login page to open your security dashboard.
              </p>
              <p><strong>Username:</strong> {securityCreds.username}</p>
              <p><strong>Password:</strong> {securityCreds.password}</p>
            </div>
          ) : (
            <p className="owner-properties-meta">
              Security credentials will appear once your role is set to owner by admin.
            </p>
          )}

          <form className="owner-security-form" onSubmit={handleSecurityUpdate}>
            <h3>Change Security Credentials</h3>
            <p className="owner-security-note">
              New security password must be different from your owner dashboard login password.
            </p>

            <input
              type="text"
              name="username"
              placeholder="Security username"
              value={securityForm.username}
              onChange={handleSecurityFormChange}
            />
            <input
              type="password"
              name="password"
              placeholder="New security password"
              value={securityForm.password}
              onChange={handleSecurityFormChange}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new security password"
              value={securityForm.confirmPassword}
              onChange={handleSecurityFormChange}
            />

            <button type="submit" disabled={securitySaving}>
              {securitySaving ? 'Saving...' : 'Update Security Credentials'}
            </button>

            {securityMessage && <p className="owner-security-success">{securityMessage}</p>}
            {securityError && <p className="owner-security-error">{securityError}</p>}
          </form>
        </section>

        <section className="owner-properties-section">
          <h2 className="owner-properties-title">My Properties</h2>

          {loading && <p className="owner-properties-meta">Loading your properties...</p>}
          {!loading && error && <p className="owner-properties-error">{error}</p>}

          {!loading && !error && properties.length === 0 && (
            <p className="owner-properties-meta">You have not added any properties yet.</p>
          )}

          {!loading && !error && properties.length > 0 && (
            <div className="owner-properties-list">
              {properties.map((property) => (
                <article key={property._id} className="owner-property-card">
                  <div className="owner-property-head">
                    <h3>{property.title}</h3>
                    <div className="owner-property-badges">
                      <span className={`owner-status-badge owner-status-${property.status}`}>
                        {property.status}
                      </span>
                      <span
                        className={`owner-status-badge owner-availability-${property.availabilityState || 'available'}`}
                      >
                        {(property.availabilityState || 'available') === 'available'
                          ? 'available'
                          : 'not available'}
                      </span>
                    </div>
                  </div>
                  <p className="owner-property-location">
                    {property.city} - {property.address}
                  </p>
                  <p className="owner-property-meta">
                    {property.sportType} | {property.propertyType} | Rs. {property.pricePerHour}/hour
                  </p>
                  <button
                    type="button"
                    className="owner-availability-btn"
                    onClick={() => toggleAvailability(property)}
                    disabled={availabilityUpdatingId === property._id}
                  >
                    {availabilityUpdatingId === property._id
                      ? 'Updating...'
                      : (property.availabilityState || 'available') === 'available'
                        ? 'Set Not Available'
                        : 'Set Available'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
