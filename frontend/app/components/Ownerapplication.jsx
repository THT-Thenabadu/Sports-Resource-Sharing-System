'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../component-styles/Ownerapplication.css';

export default function OwnerApplication() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [form, setForm] = useState({
    businessName: '',
    businessType: 'Individual Owner',
    phone: '',
    idNumber: '',
    country: 'United States',
    province: '',
    address: '',
    propertyCount: '1',
    bio: '',
    agreeTerms: false,
    agreeAccuracy: false,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) setUserName(user.name);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Basic validation
    if (!form.agreeTerms || !form.agreeAccuracy) {
      alert('Please agree to both checkboxes before submitting.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/owner-application/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: form.businessName,
          businessType: form.businessType,
          phone: form.phone,
          idNumber: form.idNumber,
          country: form.country,
          province: form.province,
          address: form.address,
          propertyCount: form.propertyCount,
          bio: form.bio,
        })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert('Application submitted! You will hear back within 24 hours.');
        router.push('/');
      } else {
       
        alert(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Could not connect to server');
    }
  };

  return (
    <div className="oa-page">
      {/* Page Header */}
      <div className="oa-page-header">
        <h1 className="oa-page-title">Partner with Sportek Elite Arena</h1>
        <p className="oa-page-subtitle">
          Transform your sports facility into a high-performance business. Join the most
          exclusive network of athletic venues in the country.
        </p>
      </div>

      {/* Main Card */}
      <div className="oa-card">

        {/* ─── Left: Form ─────────────────────────────── */}
        <div className="oa-form-col">
          <form onSubmit={handleSubmit} className="oa-form">

            {/* Section 1 — Business Identity */}
            <section className="oa-section">
              <div className="oa-section-title">
                <span className="oa-section-num">1</span>
                <h2>Business Identity</h2>
              </div>
              <div className="oa-grid">
                <div className="oa-field">
                  <label className="oa-label">Full Name</label>
                  <input className="oa-input oa-input--readonly" type="text" value={userName} readOnly />
                </div>
                <div className="oa-field">
                  <label className="oa-label">Business Name</label>
                  <input className="oa-input" type="text" name="businessName" placeholder="Enter your business name" value={form.businessName} onChange={handleChange} />
                </div>
                <div className="oa-field">
                  <label className="oa-label">Business Type</label>
                  <select className="oa-input" name="businessType" value={form.businessType} onChange={handleChange}>
                    <option>Individual Owner</option>
                    <option>Company</option>
                    <option>Sports Club</option>
                    <option>Government/Municipal</option>
                  </select>
                </div>
                <div className="oa-field">
                  <label className="oa-label">Phone Number</label>
                  <input className="oa-input" type="tel" name="phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange} />
                </div>
                <div className="oa-field oa-field--full">
                  <label className="oa-label">National ID / Business Registration Number</label>
                  <input className="oa-input" type="text" name="idNumber" placeholder="Official Identification Number" value={form.idNumber} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* Section 2 — Location */}
            <section className="oa-section">
              <div className="oa-section-title">
                <span className="oa-section-num">2</span>
                <h2>Location Details</h2>
              </div>
              <div className="oa-grid">
                <div className="oa-field">
                  <label className="oa-label">Country</label>
                  <select className="oa-input" name="country" value={form.country} onChange={handleChange}>
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Sri Lanka</option>
                    <option>India</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="oa-field">
                  <label className="oa-label">Province / State</label>
                  <input className="oa-input" type="text" name="province" placeholder="State or Province" value={form.province} onChange={handleChange} />
                </div>
                <div className="oa-field oa-field--full">
                  <label className="oa-label">Full Address</label>
                  <textarea className="oa-input oa-textarea" name="address" rows={3} placeholder="Enter the complete business address" value={form.address} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* Section 3 — Experience */}
            <section className="oa-section">
              <div className="oa-section-title">
                <span className="oa-section-num">3</span>
                <h2>Experience</h2>
              </div>
              <div className="oa-grid oa-grid--single">
                <div className="oa-field">
                  <label className="oa-label">How many properties do you own?</label>
                  <select className="oa-input" name="propertyCount" value={form.propertyCount} onChange={handleChange}>
                    <option>1</option>
                    <option>2-5</option>
                    <option>6-10</option>
                    <option>10+</option>
                  </select>
                </div>
                <div className="oa-field">
                  <label className="oa-label">Brief Bio / Experience Description</label>
                  <textarea className="oa-input oa-textarea" name="bio" rows={4} maxLength={300} placeholder="Tell us about your history in sports management..." value={form.bio} onChange={handleChange} />
                  <p className="oa-char-count">{form.bio.length}/300</p>
                </div>
              </div>
            </section>

            {/* Section 4 — Agreement */}
            <section className="oa-agreement">
              <label className="oa-checkbox-row">
                <input type="checkbox" name="agreeTerms" checked={form.agreeTerms} onChange={handleChange} className="oa-checkbox" />
                <span>I agree to the Sportek Partner Terms of Service and acknowledge the Privacy Policy.</span>
              </label>
              <label className="oa-checkbox-row">
                <input type="checkbox" name="agreeAccuracy" checked={form.agreeAccuracy} onChange={handleChange} className="oa-checkbox" />
                <span>I confirm that all provided business documentation and information are accurate and verifiable.</span>
              </label>
            </section>

            {/* Submit */}
            <div className="oa-submit-wrap">
              <p className="oa-submit-note">Your application will be reviewed within 24 hours</p>
              <button type="submit" className="oa-submit-btn">
                Submit Application
              </button>
            </div>

          </form>
        </div>

        {/* ─── Right: Benefits ─────────────────────────── */}
        <div className="oa-benefits-col">
          <div className="oa-benefits-orb oa-benefits-orb--top" />
          <div className="oa-benefits-orb oa-benefits-orb--bottom" />

          <div className="oa-benefits-inner">
            <div>
              <h2 className="oa-benefits-title">Why list with Sportek Elite?</h2>
              <p className="oa-benefits-subtitle">Join over 12,000 premium facilities globally and start scaling your athletic business today.</p>
            </div>

            <div className="oa-benefits-list">
              {[
                { icon: 'payments', title: 'Earn Revenue', desc: 'Automated booking systems ensure you maximize your court or field occupancy around the clock.' },
                { icon: 'groups', title: 'Reach Thousands', desc: 'Instant visibility to our active community of 500k+ verified athletes and sports teams.' },
                { icon: 'sell', title: 'Free Listing', desc: 'No upfront costs or subscription fees. We only succeed when you get bookings.' },
                { icon: 'support_agent', title: 'Dedicated Support', desc: 'Get a personal account manager to help optimize your listing and manage logistics.' },
              ].map((b) => (
                <div key={b.title} className="oa-benefit-item">
                  <div className="oa-benefit-icon">
                    <span className="material-symbols-outlined">{b.icon}</span>
                  </div>
                  <div>
                    <h3 className="oa-benefit-title">{b.title}</h3>
                    <p className="oa-benefit-desc">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="oa-social-proof">
              <div className="oa-social-proof-top">
                <div className="oa-avatars">
                  <img src="https://images.unsplash.com/photo-1540747913346-19e32fc3e666" alt="partner" className="oa-avatar" />
                  <img src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0" alt="partner" className="oa-avatar" />
                  <div className="oa-avatar-more">1k+</div>
                </div>
                <span className="oa-social-label">Recent Signups</span>
              </div>
              <p className="oa-social-quote">"Joining Sportek was the best decision for our tennis academy. Bookings increased by 40% in the first month."</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}