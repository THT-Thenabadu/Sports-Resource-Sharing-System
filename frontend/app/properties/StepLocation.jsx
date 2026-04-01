import './StepLocation.css';

export default function StepLocation({ data, onChange, onNext, onBack }) {
  return (
    <div className="step-layout">

      {/* Left: Form */}
      <div className="step-form-col">
        <div className="step-card">

          <div className="step-field">
            <label className="step-label">Street Address</label>
            <div style={{ position: 'relative' }}>
              <input
                className="step-input"
                type="text"
                placeholder="e.g. 123 Stadium Way"
                value={data.address}
                onChange={e => onChange('address', e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <span className="material-symbols-outlined" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#74777f', fontSize: 20 }}>location_on</span>
            </div>
          </div>

          <div className="step-row">
            <div className="step-field">
              <label className="step-label">City</label>
              <input
                className="step-input"
                type="text"
                placeholder="Enter city"
                value={data.city}
                onChange={e => onChange('city', e.target.value)}
              />
            </div>
            <div className="step-field">
              <label className="step-label">Postal Code</label>
              <input
                className="step-input"
                type="text"
                placeholder="Optional"
                value={data.postalCode}
                onChange={e => onChange('postalCode', e.target.value)}
              />
            </div>
          </div>

          <div className="step-field">
            <label className="step-label">Google Maps Link <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: '#74777f' }}>(Optional)</span></label>
            <div style={{ position: 'relative' }}>
              <input
                className="step-input"
                type="url"
                placeholder="https://goo.gl/maps/..."
                value={data.mapsLink}
                onChange={e => onChange('mapsLink', e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <span className="material-symbols-outlined" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#74777f', fontSize: 20 }}>link</span>
            </div>
            <p style={{ fontFamily: 'Manrope', fontSize: 11, color: '#74777f', fontStyle: 'italic', marginTop: 4 }}>
              Adding a link helps athletes find your entrance more accurately.
            </p>
          </div>

        </div>

        {/* Nav */}
        <div className="step-nav">
          <button className="step-btn-back" onClick={onBack}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
          <button className="step-btn-next" onClick={onNext}>
            Continue to Step 3
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Right: Aside */}
      <div className="step-aside-col">
        <div className="step-aside-img-wrap">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK86j9J2Cmh73kF7lzUP6otHpA817D7l1b17XWXPeSUEdF9pT2v4hmk9UpMMREwoPVcmkx6djlu6dVnO5ChpmWBnA62_D2fh2GCl0v_VOUya-eecFmE-bin0nUMetnSRp4NSeZr5-3rbKzx1mCUK88jAk9B5BqNjYTxPubOw6_ciM1f9UEerKMkvRS3V3v3UL6fFXwB23XsvAGyV4HRgD8rE_H4i5vi4PtYOF03k_4wzwoP8ACLpjwP25oJ1DmvqoiQueFWtaGRRo"
            alt="Arena aerial"
            className="step-aside-img"
            style={{ aspectRatio: '4/3' }}
          />
          <div className="step-aside-overlay" />
          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ background: '#005eb2', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 13, fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <span style={{ fontFamily: 'Manrope', fontSize: 10, fontWeight: 700, color: '#001f3f', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Location Intelligence</span>
              </div>
              <p style={{ fontFamily: 'Manrope', fontSize: 12, color: 'rgba(0,31,63,0.8)', fontWeight: 500 }}>Accurate location data increases booking conversion by 40%.</p>
            </div>
          </div>
        </div>

        <div className="step-aside-info">
          <h3>Why this matters?</h3>
          <p>Your location determines which local leagues and training squads see your facility first. We use this address to generate your automated map marker and navigation directions for guests.</p>
        </div>
      </div>

    </div>
  );
}