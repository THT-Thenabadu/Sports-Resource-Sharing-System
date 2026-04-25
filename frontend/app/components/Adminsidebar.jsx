'use client';
import Link from 'next/link';
import '../component-styles/Adminsidebar.css';

const navItems = [
    { icon: 'dashboard', label: 'Dashboard', href: '/dashboard/admin' },
    { icon: 'calendar_today', label: 'Manage Bookings', href: '/dashboard/admin/bookings' },
    { icon: 'event', label: 'Manage Events', href: '/dashboard/admin/events' },
    { icon: 'rate_review', label: 'Manage Reviews & feedbacks', href: '/hub/admin' },
    { icon: 'group', label: 'Manage Users', href: '/dashboard/admin/users', active: true },
];

export default function AdminSidebar() {
    return (
        <aside className="admin-sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <span style={{ fontSize: '24px', fontWeight: '900', color: '#fff', fontStyle: 'italic' }}>S</span>
                </div>
                <div>
                    <h1 className="sidebar-title">Sportek</h1>
                    <p className="sidebar-subtitle">Admin Console</p>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`sidebar-link ${item.active ? 'sidebar-link--active' : ''}`}
                    >
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Admin Profile */}
            {/*<div className="sidebar-profile">*/}
            {/*    <div className="sidebar-profile-card">*/}
            {/*        <img*/}
            {/*            src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0"*/}
            {/*            alt="Admin"*/}
            {/*            className="sidebar-avatar"*/}
            {/*        />*/}
            {/*        /!*<div className="sidebar-profile-info">*!/*/}
            {/*        /!*    <p className="sidebar-profile-name">Alex Sterling</p>*!/*/}
            {/*        /!*    <p className="sidebar-profile-role">Super Admin</p>*!/*/}
            {/*        /!*</div>*!/*/}
            {/*    </div>*/}
            {/*</div>*/}
        </aside>
    );
}