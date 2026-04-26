'use client';
import { useState, useEffect } from 'react';
import '../component-styles/Userstable.css';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null); // ✅ selected application for modal

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          console.error('Authentication token not found.');
          // Optionally set an error state here to show in the UI
          return;
        }
        const res = await fetch('http://localhost:8000/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          // Handle non-successful responses (like 403 Forbidden)
          const errorData = await res.json().catch(() => ({ message: res.statusText }));
          throw new Error(errorData.message || 'Failed to fetch users');
        }

        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
// <<<<<<< HEAD
      //   setUsers([]); // Ensure users is an array on error to prevent .map crash
      // } finally {
      //   setLoading(false);
// =======
// >>>>>>> feature01
    };

    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/owner-application/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setApplications(data);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      }
    };

    const loadAll = async () => {
      await Promise.all([fetchUsers(), fetchApplications()]);
      setLoading(false);
    };

    loadAll();
  }, []);

  const approveApplication = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:8000/api/owner-application/approve/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setApplications(prev => prev.map(a => a._id === id ? { ...a, status: 'approved' } : a));
      // ✅ update modal too if open
      setSelectedApp(prev => prev?._id === id ? { ...prev, status: 'approved' } : prev);
    }
  };

  const rejectApplication = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:8000/api/owner-application/reject/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setApplications(prev => prev.map(a => a._id === id ? { ...a, status: 'rejected' } : a));
      // ✅ update modal too if open
      setSelectedApp(prev => prev?._id === id ? { ...prev, status: 'rejected' } : prev);
    }
  };

  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'owner' ? 'customer' : 'owner';
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/auth/update-role/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  if (loading) return <p style={{ fontFamily: 'Manrope', padding: '24px' }}>Loading...</p>;

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  if (!users.length) return <p style={{ fontFamily: 'Manrope', padding: '24px' }}>No users found or you do not have permission to view them.</p>;

  return (
    <>
      <div className="users-table-wrapper">

        {/* Tabs */}
        <div className="table-tabs">
          <button
            className={`table-tab ${activeTab === 'users' ? 'table-tab--active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            All Users
          </button>
          <button
            className={`table-tab ${activeTab === 'applications' ? 'table-tab--active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Owner Applications
            {pendingCount > 0 && (
              <span className="table-tab-badge">{pendingCount}</span>
            )}
          </button>
        </div>

        <div className="users-table-scroll">

          {/* Users Tab */}
          {activeTab === 'users' && (
            <table className="users-table">
              <thead>
                <tr className="users-table-head-row">
                  <th className="users-th">Name / Email</th>
                  <th className="users-th">Date Joined</th>
                  <th className="users-th">Role</th>
                  <th className="users-th users-th--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="users-tr">
                    <td className="users-td">
                      <div className="user-identity">
                        <div className="user-avatar-initials">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="user-name">{user.name}</p>
                          <p className="user-email">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="users-td users-td--meta">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td className="users-td">
                      <span className={`role-badge role-badge--${user.role}`}>
                        {user.role === 'owner' ? 'Property Owner' : user.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="users-td users-td--right">
                      <div className="user-actions">
                        {user.role !== 'admin' && (
                          <button
                            className="action-btn action-btn--primary"
                            title="Toggle Role"
                            onClick={() => toggleRole(user._id, user.role)}
                          >
                            <span className="material-symbols-outlined">swap_horiz</span>
                          </button>
                        )}
                        <button className="action-btn action-btn--secondary" title="More Options">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <table className="users-table">
              <thead>
                <tr className="users-table-head-row">
                  <th className="users-th">Applicant</th>
                  <th className="users-th">Business Name</th>
                  <th className="users-th">Type</th>
                  <th className="users-th">Applied</th>
                  <th className="users-th">Status</th>
                  <th className="users-th users-th--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', fontFamily: 'Manrope', color: '#43474e' }}>
                      No applications yet
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app._id}
                      className="users-tr users-tr--clickable"
                      onClick={() => setSelectedApp(app)} // ✅ click row to open modal
                    >
                      <td className="users-td">
                        <div className="user-identity">
                          <div className="user-avatar-initials">
                            {app.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="user-name">{app.user?.name}</p>
                            <p className="user-email">{app.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="users-td users-td--meta">{app.businessName}</td>
                      <td className="users-td users-td--meta">{app.businessType}</td>
                      <td className="users-td users-td--meta">
                        {new Date(app.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                      <td className="users-td">
                        <span className={`role-badge role-badge--${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="users-td users-td--right">
                        {app.status === 'pending' && (
                          <div className="user-actions" onClick={e => e.stopPropagation()}>
                            <button
                              className="action-btn"
                              style={{ color: '#005eb2' }}
                              title="Approve"
                              onClick={() => approveApplication(app._id)}
                            >
                              <span className="material-symbols-outlined">check_circle</span>
                            </button>
                            <button
                              className="action-btn"
                              style={{ color: '#ba1a1a' }}
                              title="Reject"
                              onClick={() => rejectApplication(app._id)}
                            >
                              <span className="material-symbols-outlined">cancel</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="table-footer">
          <p className="table-count">
            {activeTab === 'users'
              ? `Showing ${users.length} users`
              : `Showing ${applications.length} applications`}
          </p>
        </div>
      </div>

      {/* ✅ Application Detail Modal */}
      {selectedApp && (
        <div className="app-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="app-modal" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="app-modal-header">
              <div className="app-modal-header-left">
                <div className="user-avatar-initials app-modal-avatar">
                  {selectedApp.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="app-modal-name">{selectedApp.user?.name}</h2>
                  <p className="app-modal-email">{selectedApp.user?.email}</p>
                </div>
              </div>
              <div className="app-modal-header-right">
                <span className={`role-badge role-badge--${selectedApp.status}`}>
                  {selectedApp.status}
                </span>
                <button className="app-modal-close" onClick={() => setSelectedApp(null)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="app-modal-body">

              {/* Section 1 — Business Identity */}
              <div className="app-modal-section">
                <p className="app-modal-section-title">
                  <span className="material-symbols-outlined">business</span>
                  Business Identity
                </p>
                <div className="app-modal-grid">
                  <div className="app-modal-field">
                    <p className="app-modal-field-label">Business Name</p>
                    <p className="app-modal-field-value">{selectedApp.businessName}</p>
                  </div>
                  <div className="app-modal-field">
                    <p className="app-modal-field-label">Business Type</p>
                    <p className="app-modal-field-value">{selectedApp.businessType}</p>
                  </div>
                  <div className="app-modal-field">
                    <p className="app-modal-field-label">Phone</p>
                    <p className="app-modal-field-value">{selectedApp.phone}</p>
                  </div>
                  <div className="app-modal-field">
                    <p className="app-modal-field-label">ID / Registration No.</p>
                    <p className="app-modal-field-value">{selectedApp.idNumber}</p>
                  </div>
                </div>
              </div>

              {/* Section 2 — Location */}
              <div className="app-modal-section">
                <p className="app-modal-section-title">
                  <span className="material-symbols-outlined">location_on</span>
                  Location
                </p>
                <div className="app-modal-grid">
                  <div className="app-modal-field">
                    <p className="app-modal-field-label">Country</p>
                    <p className="app-modal-field-value">{selectedApp.country}</p>
                  </div>
                  <div className="app-modal-field">
                    <p className="app-modal-field-label">Province / State</p>
                    <p className="app-modal-field-value">{selectedApp.province}</p>
                  </div>
                  <div className="app-modal-field app-modal-field--full">
                    <p className="app-modal-field-label">Full Address</p>
                    <p className="app-modal-field-value">{selectedApp.address}</p>
                  </div>
                </div>
              </div>

              {/* Section 3 — Experience */}
              <div className="app-modal-section">
                <p className="app-modal-section-title">
                  <span className="material-symbols-outlined">workspace_premium</span>
                  Experience
                </p>
                <div className="app-modal-grid">
                  <div className="app-modal-field">
                    <p className="app-modal-field-label">Properties Owned</p>
                    <p className="app-modal-field-value">{selectedApp.propertyCount}</p>
                  </div>
                  <div className="app-modal-field app-modal-field--full">
                    <p className="app-modal-field-label">Bio</p>
                    <p className="app-modal-field-value">{selectedApp.bio || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Applied date */}
              <p className="app-modal-date">
                Applied on {new Date(selectedApp.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>

            {/* Modal Footer — approve/reject */}
            {selectedApp.status === 'pending' && (
              <div className="app-modal-footer">
                <button
                  className="app-modal-btn app-modal-btn--reject"
                  onClick={() => rejectApplication(selectedApp._id)}
                >
                  <span className="material-symbols-outlined">cancel</span>
                  Reject Application
                </button>
                <button
                  className="app-modal-btn app-modal-btn--approve"
                  onClick={() => approveApplication(selectedApp._id)}
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Approve Application
                </button>
              </div>
            )}

            {/* Already actioned state */}
            {selectedApp.status !== 'pending' && (
              <div className="app-modal-footer app-modal-footer--actioned">
                <p className="app-modal-actioned-text">
                  <span className="material-symbols-outlined">
                    {selectedApp.status === 'approved' ? 'check_circle' : 'cancel'}
                  </span>
                  This application has been {selectedApp.status}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}