'use client';
import { useState, useEffect } from 'react';
import '../component-styles/Userstable.css';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]); // ✅ was missing
  const [activeTab, setActiveTab] = useState('users');   // ✅ was missing
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    const fetchApplications = async () => { // ✅ moved inside useEffect so it runs
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
      
      // Find the application to get the user ID
      const app = applications.find(a => a._id === id);
      if (app && app.user && app.user._id) {
        // Automatically update the user's role in the all users list
        setUsers(prev => prev.map(u => 
          u._id === app.user._id ? { ...u, role: 'owner' } : u
        ));
      }
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
    }
  };

  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'owner' ? 'customer' : 'owner';
    const confirmed = window.confirm(`Are you sure you want to change this user's role to ${newRole}?`);
    if (!confirmed) return;
    
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

  return (
    <div className="users-table-wrapper">

      {/* ✅ Tabs */}
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

        {/* ✅ Users Tab */}
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
                          className="action-btn-solid role-btn"
                          onClick={() => toggleRole(user._id, user.role)}
                        >
                          Change Role
                        </button>
                      )}
                      <button className="action-btn-solid manage-btn">
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ✅ Applications Tab */}
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
                  <tr key={app._id} className="users-tr">
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
                        <div className="user-actions">
                          <button
                            className="action-btn-solid success-btn"
                            onClick={() => approveApplication(app._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="action-btn-solid danger-btn"
                            onClick={() => rejectApplication(app._id)}
                          >
                            Reject
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
  );
}