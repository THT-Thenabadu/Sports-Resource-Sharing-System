'use client';
import { useState, useEffect } from 'react';
import '../component-styles/Userstable.css';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
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
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

  if (loading) return <p style={{ fontFamily: 'Manrope', padding: '24px' }}>Loading users...</p>;

  return (
    <div className="users-table-wrapper">
      <div className="users-table-scroll">
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

                {/* Name / Email */}
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

                {/* Date Joined */}
                <td className="users-td users-td--meta">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </td>

                {/* Role Badge */}
                <td className="users-td">
                  <span className={`role-badge role-badge--${user.role}`}>
                    {user.role === 'owner' ? 'Property Owner' : user.role === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                </td>

                {/* Actions */}
                <td className="users-td users-td--right">
                  <div className="user-actions">
                    {/* Don't allow toggling admin role */}
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
      </div>

      {/* Footer */}
      <div className="table-footer">
        <p className="table-count">Showing {users.length} users</p>
      </div>
    </div>
  );
}