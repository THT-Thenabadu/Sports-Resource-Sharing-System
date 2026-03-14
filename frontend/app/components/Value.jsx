import React from 'react';
import '../component-styles/Value.css';

const features = [
  {
    icon: (
      <svg className="feature-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    ),
    title: 'Secure Bookings',
    description: 'Encrypted payments and automated scheduling for a worry-free experience.',
  },
  {
    icon: (
      <svg className="feature-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    ),
    title: 'Verified Owners',
    description: 'Every facility and host undergoes a rigorous verification process.',
  },
  {
    icon: (
      <svg className="feature-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    ),
    title: 'Gear Variety',
    description: 'Access professional-grade equipment along with your court booking.',
  },
];

const ValueProposition = () => {
  return (
    <section className="value-prop" data-purpose="value-proposition">
      <div className="value-prop-container">
        <div className="value-prop-header">
          <h2 className="value-prop-title">Why Sportek?</h2>
          <div className="value-prop-divider" />
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrap">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;