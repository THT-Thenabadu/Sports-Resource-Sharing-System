'use client';
import { useState } from 'react';
import '../component-styles/Userstable.css';

const initialUsers = [
    {
        id: 1,
        name: 'Marcus Chen',
        email: 'm.chen@example.com',
        joined: 'Oct 12, 2023',
        lastLogin: '2 hours ago',
        role: 'owner',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADxElb1A5NYMRvLxO8wyB4134sJACjUmIvh5n2sHHk8qwfBcA0jTu1B9Wc6jS4WZUrbKx8R4gstB-9zObozZT_XWKHl80aiaH3IYd-ERoBD3ObMWw1YQtWGE6-wK27VV905ewFJRfDddE-NWW_v-tpjb6jYdRr1PUfG9c_zVCX6OxYgNFp9vFrdn2JlkDe_WhYeawi-VLXP4eg8SLOEHs5qdMAfGrb-lZ1MmYNJqY_wR8_z8HU6hc5pG5h6QcXoRIRxIcfxCDztl4',
    },
    {
        id: 2,
        name: 'Elena Rodriguez',
        email: 'elena.r@lifestyle.co',
        joined: 'Jan 05, 2024',
        lastLogin: 'Just now',
        role: 'customer',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6U7hlJthT6xR5XeJjGqWgURKJFwO1Z_GaxVyt8YkknR4311zwo__UeKneWULDO9sC3CQLJ6uAO1-BiLMKhhIhrLj_nE5wFtgH9kk3koSf1B6Vy3DTv7BbuN_k3LNQCLnEGBJ0REZbSrlIyzQG2Xb_VZr-97EGa_tRgIxtLiEOUBOSuZNmBywIsyZHRITxAAbA9F3MCtTt2-b_Egpvhj7zX0zdUCjwKxSH_Odpqn9i_3vplzHUkBeyMUmsiCCxaRyTdelHUsMaj2Q',
    },
    {
        id: 3,
        name: 'James Wilson',
        email: 'wilson.j@sportmail.com',
        joined: 'Mar 22, 2023',
        lastLogin: 'Yesterday',
        role: 'owner',
        avatar: null,
        initials: 'JW',
    },
    {
        id: 4,
        name: 'David Miller',
        email: 'miller.d@web.com',
        joined: 'Feb 18, 2024',
        lastLogin: '5 days ago',
        role: 'customer',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUfCjX3vIZVNzpYqR4B0BlcwrCXOu9ddP4fZsoswtrJD0jK-Rh-irdkW_DaMjkM2OYZWBdho3cPMmLV6Q-MxmYK_I4tyTPv0_P99JJiuKAFRjyYA3As_eu7N4gZdxa_XGj8MEwlw_C1SjhtbJDmQwZAgF_WOXYFBNM5mRTSkAMiBMZ0i3y9qFz7bNGjEyaTKhm9iUi_7q7jUNylE2ZuHcqEZqIL2lA_alMWeZjw6YP0Pcqfo-Zt3sHg82eLz7mR-gWSS3xKCZtXc0',
    },
];

export default function UsersTable() {
    const [users, setUsers] = useState(initialUsers);

    const toggleRole = (id) => {
        setUsers((prev) =>
            prev.map((u) =>
                u.id === id ? { ...u, role: u.role === 'owner' ? 'customer' : 'owner' } : u
            )
        );
    };

    return (
        <div className="users-table-wrapper">
            <div className="users-table-scroll">
                <table className="users-table">
                    <thead>
                    <tr className="users-table-head-row">
                        <th className="users-th">Name / Email</th>
                        <th className="users-th">Date Joined</th>
                        <th className="users-th">Last Login</th>
                        <th className="users-th">Current Role</th>
                        <th className="users-th users-th--right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="users-tr">
                            {/* Name / Email */}
                            <td className="users-td">
                                <div className="user-identity">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="user-avatar" />
                                    ) : (
                                        <div className="user-avatar-initials">{user.initials}</div>
                                    )}
                                    <div>
                                        <p className="user-name">{user.name}</p>
                                        <p className="user-email">{user.email}</p>
                                    </div>
                                </div>
                            </td>

                            {/* Date Joined */}
                            <td className="users-td users-td--meta">{user.joined}</td>

                            {/* Last Login */}
                            <td className="users-td users-td--meta">{user.lastLogin}</td>

                            {/* Role Badge */}
                            <td className="users-td">
                  <span className={`role-badge role-badge--${user.role}`}>
                    {user.role === 'owner' ? 'Property Owner' : 'Customer'}
                  </span>
                            </td>

                            {/* Actions */}
                            <td className="users-td users-td--right">
                                <div className="user-actions">
                                    <button
                                        className="action-btn action-btn--primary"
                                        title="Toggle Role"
                                        onClick={() => toggleRole(user.id)}
                                    >
                                        <span className="material-symbols-outlined">swap_horiz</span>
                                    </button>
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

            {/* Pagination Footer */}
            <div className="table-footer">
                <p className="table-count">Showing 1 to 4 of 12,482 users</p>
                <div className="pagination">
                    <button className="page-btn page-btn--nav" disabled>
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    {[1, 2, 3].map((n) => (
                        <button key={n} className={`page-btn ${n === 1 ? 'page-btn--active' : ''}`}>
                            {n}
                        </button>
                    ))}
                    <span className="page-ellipsis">...</span>
                    <button className="page-btn">312</button>
                    <button className="page-btn page-btn--nav">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
}