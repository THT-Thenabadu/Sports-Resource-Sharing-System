'use client';
import '../component-styles/AdminTopBar.css';

export default function AdminTopBar() {
    return (
        <header className="admin-topbar">
            {/* Search */}
            <div className="topbar-search-wrapper">
                <span className="material-symbols-outlined topbar-search-icon">search</span>
                <input
                    className="topbar-search-input"
                    type="text"
                    placeholder="Search users by name, email or role..."
                />
            </div>

            {/* Actions */}
            <div className="topbar-actions">
                <button className="topbar-icon-btn">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="topbar-badge" />
                </button>
                <button className="topbar-icon-btn">
                    <span className="material-symbols-outlined">settings</span>
                </button>
            </div>
        </header>
    );
}