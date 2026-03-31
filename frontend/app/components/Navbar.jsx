'use client';
import React, { useEffect, useState } from 'react';
import '../component-styles/Navbar.css';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const loadUser = () => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    else setUser(null);
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('userUpdated', loadUser);
    return () => window.removeEventListener('userUpdated', loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('userUpdated'));
    router.push('/');
  };

  return (
    <nav className="navbar" data-purpose="main-navigation">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <span>S</span>
        </div>
        <Link href="/" className="navbar-title">SPORTEK</Link>
      </div>

      <div className="navbar-links">
        {user ? (
          <>
            <span className="navbar-username">Hi, {user.name}!</span>

            {/* ✅ Profile image — clicking goes to dashboard */}
            <div 
              className="navbar-profile"
              onClick={() => router.push(user.role === 'owner' ? '/dashboard/owner' : '/dashboard/customer')}
            >
              <Image
                src="/images/default-avatar.png" // ✅ put your draft image here
                alt="Profile"
                width={38}
                height={38}
                className="navbar-avatar"
              />
            </div>

            <button className="navbar-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="navbar-link">Login</Link>
            <Link href="/register" className="navbar-btn">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;