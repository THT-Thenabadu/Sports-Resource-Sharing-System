import React from 'react';
import '../component-styles/Navbar.css';
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="navbar" data-purpose="main-navigation">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <span>S</span>
        </div>
        <Link href="/" className="navbar-title">SPORTEK</Link>
      </div>

      <div className="navbar-links">
        <Link href="/login" className="navbar-link">Login</Link>
        <Link href="/register" className="navbar-btn">Register</Link>
      </div>
    </nav>
  );
};

export default Navbar;