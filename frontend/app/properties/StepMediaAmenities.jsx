'use client';
import { useRef } from 'react';
import './StepMediaAmenities.css';

const AMENITIES = [
  { key: 'parking', icon: 'local_parking', label: 'Parking', desc: 'On-site secure parking' },
  { key: 'changingRooms', icon: 'checkroom', label: 'Changing Rooms', desc: 'Private locker areas' },
  { key: 'showers', icon: 'shower', label: 'Showers', desc: 'Heated shower facilities' },
  { key: 'floodlights', icon: 'flood', label: 'Floodlights', desc: 'Professional LED lighting' },
  { key: 'cafeteria', icon: 'coffee', label: 'Cafeteria', desc: 'Food and beverage on-site', wide: true },
];

export default function StepMediaAmenities({ data, onChange, onSubmit, onBack }) {
  const fileInputRef = useRef(null);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const current = data.images || [];
    const combined = [...current, ...files].slice(0, 5);
    onChange('images', combined);
  };

  const removeImage = (index) => {
    const updated = (data.images || []).filter((_, i) => i !== index);
    onChange('images', updated);
  };

  const toggleAmenity = (key) => {
    const current = data.amenities || [];
    const updated = current.includes(key)
      ? current.filter(a => a !== key)
      : [...current, key];
    onChange('amenities', updated);
  };

  const images = data.images || [];
  const amenities = data.amenities || [];

  return (
    <div className="step-layout">

      {/* Left: Form */}
      <div className="step-form-col">

        {/* Media Upload */}
        <div className="step-card">
          <div className="media-section-title">
            <span className="material-symbols-outlined" style={{ color: '#005eb2' }}>add_a_photo</span>
            <h2>Property Gallery</h2>
          </div>
          <p className="media-desc">Upload up to 5 high-quality images. Professional photos increase booking rates by up to 40%.</p>

          <div className="media-grid">
            {/* Cover slot */}
            <div
              className="media-slot media-slot--cover"
              onClick={() => fileInputRef.current?.click()}
            >
              {images[0] ? (
                <>
                  <img src={URL.createObjectURL(images[0])} alt="cover" className="media-preview" />
                  <button className="media-remove" onClick={e => { e.stopPropagation(); removeImage(0); }}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined media-upload-icon">upload_file</span>
                  <span className="media-upload-label">Cover Image</span>
                </>
              )}
            </div>

            {/* Extra slots */}
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="media-slot media-slot--small"
                onClick={() => fileInputRef.current?.click()}
              >
                {images[i] ? (
                  <>
                    <img src={URL.createObjectURL(images[i])} alt={`img-${i}`} className="media-preview" />
                    <button className="media-remove" onClick={e => { e.stopPropagation(); removeImage(i); }}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </>
                ) : (
                  <span className="material-symbols-outlined" style={{ color: '#74777f' }}>add</span>
                )}
              </div>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleImages}
          />
        </div>

        {/* Amenities */}
        <div className="step-card" style={{ marginTop: 24 }}>
          <div className="media-section-title">
            <span className="material-symbols-outlined" style={{ color: '#005eb2' }}>sports_score</span>
            <h2>Available Amenities</h2>
          </div>
          <p className="media-desc">Select the features available at your facility.</p>

          <div className="amenities-grid">
            {AMENITIES.map(a => {
              const active = amenities.includes(a.key);
              return (
                <div
                  key={a.key}
                  className={`amenity-item ${a.wide ? 'amenity-item--wide' : ''} ${active ? 'amenity-item--active' : ''}`}
                  onClick={() => toggleAmenity(a.key)}
                >
                  <div className={`amenity-icon ${active ? 'amenity-icon--active' : ''}`}>
                    <span className="material-symbols-outlined">{a.icon}</span>
                  </div>
                  <div>
                    <p className="amenity-label">{a.label}</p>
                    <p className="amenity-desc">{a.desc}</p>
                  </div>
                  <div className={`amenity-check ${active ? 'amenity-check--active' : ''}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 22 }}>check_circle</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nav */}
        <div className="step-nav" style={{ marginTop: 24 }}>
          <button className="step-btn-back" onClick={onBack}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
          <button className="step-btn-submit" onClick={onSubmit}>
            Submit Registration
            <span className="material-symbols-outlined">done_all</span>
          </button>
        </div>
      </div>

      {/* Right: Aside */}
      <div className="step-aside-col">
        <div className="step-aside-tips">
          <h3>Registration Tips</h3>
          <ul>
            <li>
              <span className="material-symbols-outlined">lightbulb</span>
              <p>Photos of clean, empty courts perform best.</p>
            </li>
            <li>
              <span className="material-symbols-outlined">lightbulb</span>
              <p>Highlighting "Floodlights" increases night-time booking revenue by 35%.</p>
            </li>
            <li>
              <span className="material-symbols-outlined">lightbulb</span>
              <p>Be honest about amenities to maintain a high "Verified" rating.</p>
            </li>
          </ul>
          <div className="step-aside-orb" />
        </div>

        <div style={{ border: '1px solid rgba(196,198,207,0.2)', borderRadius: 12, padding: 24, background: '#f3f4f5' }}>
          <p style={{ fontFamily: 'Manrope', fontSize: 10, fontWeight: 700, color: '#43474e', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>Need Help?</p>
          <p style={{ fontFamily: 'Manrope', fontSize: 13, color: '#191c1d', lineHeight: 1.6, marginBottom: 14 }}>Our onboarding specialists are available to help you finalize your listing.</p>
          <a href="#" style={{ fontFamily: 'Manrope', fontSize: 13, fontWeight: 700, color: '#005eb2', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>support_agent</span>
            Chat with Partner Support
          </a>
        </div>

        <div className="step-aside-img-wrap">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuATXr-PVu5nT6C1Jte25uWGrY6XSfjNBfyLbU3c80_fzQrYI6Wz3h0tM8_AxezqNdt-X2sHOQ9sS5-yzNRako8v-WaZDjaXfmFkd1fZ1klrB-HqsdPF_NBdohMLZpfV1tU862iEY1R44o59gM8qbtrqvDvuTw0rya_V8A21aI91NT1OJPcah1OAi8Cr7cac57-6nLV8B3AbCzu_2tK21PhKXvFCH1Py0wZ3Y9JB_Os_6UNPPFk0cL0ToaN2slK9Abxw2V3lhyBkHXg"
            alt="Basketball court"
            className="step-aside-img"
            style={{ aspectRatio: '16/9' }}
          />
          <div className="step-aside-overlay" />
          <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: 9999, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ color: '#005eb2', fontSize: 14, fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span style={{ fontFamily: 'Manrope', fontSize: 10, fontWeight: 800, color: '#000613', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Elite Partner Example</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}