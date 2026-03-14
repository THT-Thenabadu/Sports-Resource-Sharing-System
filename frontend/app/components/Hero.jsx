import React from 'react';
import '../component-styles/Hero.css';

const Hero = () => {
  return (
    <section className="hero" data-purpose="hero-section" id="hero">
      {/* Background */}
      <div className="hero-bg">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6xxoeKGt2JLvpB2t_XaUxpx-MwT5yvTxIJMhj3a_2vkgjpo2CdSRtR09VXRa_XCN5SqLypkj4laEV_xrP2rgEIC0urLDVPW4wQEBABX7VEDU4XBZ8BnisYRrrvYv6NAZ5rQWHPRoSrEG9Lh5tqjAxFYJI7CcbnZJaGYlubogqzr7FPjr76vN6n_s6w2FspW3Xn_ODTdUOchfMPLK6XygszRixg6kLOIBLmHjhgyu2dBzcyiWqySkC-Q96DuZTL04eK0PDmnIdKPU"
          alt="Modern Sports Facility"
          className="hero-bg-img"
        />
        <div className="hero-overlay" />
      </div>

      {/* Content */}
      <div className="hero-content">
        <h1 className="hero-heading">
          Find your game.<br />
          <span className="hero-heading-sub">Share your gear.</span>
        </h1>
        <p className="hero-subtext">
          The ultimate marketplace for sports enthusiasts. Book premium facilities or monetize
          your sports infrastructure with ease.
        </p>

        {/* Search Bar */}
        <div className="search-bar" data-purpose="quick-search">
          <div className="search-field">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <input
              type="text"
              placeholder="Where are you looking?"
              className="search-input"
            />
          </div>

          <div className="search-field search-field--bordered">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <select className="search-select">
              <option value="">Select Sport Type</option>
              <option>Tennis</option>
              <option>Football</option>
              <option>Cricket</option>
              <option>Basketball</option>
            </select>
          </div>

          <button className="search-btn">Search Now</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;