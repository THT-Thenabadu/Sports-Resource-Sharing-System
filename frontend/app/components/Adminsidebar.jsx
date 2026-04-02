'use client';
import Link from 'next/link';
import '../component-styles/Adminsidebar.css';

const navItems = [
    { icon: 'dashboard', label: 'Dashboard', href: '/dashboard/admin' },
    { icon: 'calendar_today', label: 'Manage Bookings', href: '/dashboard/admin/bookings' },
    { icon: 'event', label: 'Manage Events', href: '/dashboard/admin/events' },
    { icon: 'rate_review', label: 'Manage Reviews', href: '/dashboard/admin/reviews' },
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
            <div className="sidebar-profile">
                <div className="sidebar-profile-card">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsMCAPF-OJPDXncdl9JtphJLrLeAEmgBV5HFO_AfNmmGSQh6nzA1N57XkqsSX_UFh4nNQ63e03R9yJiyGBV1v9aEKVsT9oFnfosEX5yZprgRudu_fbDxPU1g_Ts-8h9moI5HHv54XWG7hWqq2dOhjVypIcX-gmr03HTkJ2o_JvTpJ1aS1ZcduBFB17kW9adoRpb55IazrfH9CBk4p6HhziyY3rndwM1CJuQeSoKEpViPFLBQCn2IyiZS0mVIvNHiltWNKO4Lhe8eo"
                        alt="Admin"
                        className="sidebar-avatar"
                    />
                    <div className="sidebar-profile-info">
                        <p className="sidebar-profile-name">Alex Sterling</p>
                        <p className="sidebar-profile-role">Super Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}