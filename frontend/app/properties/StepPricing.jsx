import { useState } from 'react';
import './StepPricing.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StepPricing({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const toggleDay = (day) => {
    const current = data.availableDays || [];
    const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
    onChange('availableDays', updated);
    setErrors(p => ({ ...p, availableDays: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!data.pricePerHour || Number(data.pricePerHour) <= 0)
      newErrors.pricePerHour = 'Please enter a valid price greater than 0';
    if (!data.maxPlayers || Number(data.maxPlayers) <= 0)
      newErrors.maxPlayers = 'Please enter a valid number of players';
    if (!data.availableDays || data.availableDays.length === 0)
      newErrors.availableDays = 'Please select at least one available day';
    if (!data.openingTime) newErrors.openingTime = 'Opening time is required';
    if (!data.closingTime) newErrors.closingTime = 'Closing time is required';
    if (data.openingTime && data.closingTime && data.openingTime >= data.closingTime)
      newErrors.closingTime = 'Closing time must be after opening time';
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    onNext();
  };

  return (
    <div className="step-layout">
      <div className="step-form-col">
        <div className="step-card">

          <div>
            <div className="pricing-section-title">
              <span className="material-symbols-outlined" style={{ color: '#005eb2' }}>payments</span>
              <h2>Revenue Model</h2>
            </div>
            <div className="step-row">
              <div className="step-field">
                <label className="step-label">Price per Hour</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Manrope', fontWeight: 700, color: '#43474e' }}>$</span>
                  <input
                    className={`step-input ${errors.pricePerHour ? 'step-input--error' : ''}`}
                    type="number"
                    placeholder="0.00"
                    style={{ paddingLeft: 28, fontFamily: 'Lexend', fontSize: 18, color: '#001f3f' }}
                    value={data.pricePerHour}
                    onChange={e => { onChange('pricePerHour', e.target.value); setErrors(p => ({ ...p, pricePerHour: '' })); }}
                  />
                </div>
                {errors.pricePerHour && <p className="step-error">{errors.pricePerHour}</p>}
                <p style={{ fontFamily: 'Manrope', fontSize: 11, color: '#74777f', marginTop: 4 }}>Recommended: $45.00 – $65.00 for your area</p>
              </div>
              <div className="step-field">
                <label className="step-label">Max Players Allowed</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#74777f', fontSize: 20 }}>groups</span>
                  <input
                    className={`step-input ${errors.maxPlayers ? 'step-input--error' : ''}`}
                    type="number"
                    placeholder="22"
                    style={{ paddingLeft: 42, fontFamily: 'Lexend', fontSize: 18, color: '#001f3f' }}
                    value={data.maxPlayers}
                    onChange={e => { onChange('maxPlayers', e.target.value); setErrors(p => ({ ...p, maxPlayers: '' })); }}
                  />
                </div>
                {errors.maxPlayers && <p className="step-error">{errors.maxPlayers}</p>}
              </div>
            </div>
          </div>

          <div className="pricing-divider" />

          <div>
            <div className="pricing-section-title">
              <span className="material-symbols-outlined" style={{ color: '#005eb2' }}>calendar_today</span>
              <h2>Operating Hours</h2>
            </div>

            <div className="step-field" style={{ marginBottom: 20 }}>
              <label className="step-label">Available Days</label>
              <div className="days-row">
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`day-pill ${(data.availableDays || []).includes(day) ? 'day-pill--active' : ''}`}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {errors.availableDays && <p className="step-error">{errors.availableDays}</p>}
            </div>

            <div className="step-row">
              <div className="step-field">
                <label className="step-label">Opening Time</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#74777f', fontSize: 20 }}>schedule</span>
                  <input
                    className={`step-input ${errors.openingTime ? 'step-input--error' : ''}`}
                    type="time"
                    style={{ paddingLeft: 42 }}
                    value={data.openingTime}
                    onChange={e => { onChange('openingTime', e.target.value); setErrors(p => ({ ...p, openingTime: '', closingTime: '' })); }}
                  />
                </div>
                {errors.openingTime && <p className="step-error">{errors.openingTime}</p>}
              </div>
              <div className="step-field">
                <label className="step-label">Closing Time</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#74777f', fontSize: 20 }}>bedtime</span>
                  <input
                    className={`step-input ${errors.closingTime ? 'step-input--error' : ''}`}
                    type="time"
                    style={{ paddingLeft: 42 }}
                    value={data.closingTime}
                    onChange={e => { onChange('closingTime', e.target.value); setErrors(p => ({ ...p, closingTime: '' })); }}
                  />
                </div>
                {errors.closingTime && <p className="step-error">{errors.closingTime}</p>}
              </div>
            </div>
          </div>

        </div>

        <div className="step-nav">
          <button className="step-btn-back" onClick={onBack}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
          <button className="step-btn-next" onClick={handleNext}>
            Next Step
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Right aside unchanged */}
      <div className="step-aside-col">
        <div className="step-aside-img-wrap">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqCX4EHyHxoPICCAB3-2WP5XQozHfejpeN-y8zbiXDUN7MEbV3tQTvWzR5ZnVLT5BBa5oQdQ-wTf-tz4K0d8gTAeiiYUnHEELnxa102XI-YXDV6rVCEx4Sr5udWUSbip2_M8yaUkhDnfNZaOT-ld6upsCqAwcwr84ptHe56FWSVvw8UdCIozfI-NaFRRXL5OCdo4zvv_FgOMZCXpq09nWjFXLFT3u-Dbiik1wdpwj3E9jsgfp5aCN9QLBqisFU4kvADB90TtutCCU" alt="Court" className="step-aside-img" style={{ aspectRatio: '4/3' }} />
          <div className="step-aside-overlay" />
          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '14px 16px' }}>
              <h4 style={{ fontFamily: 'Lexend', fontWeight: 700, color: '#fff', marginBottom: 6, fontSize: 14 }}>Owner Tip</h4>
              <p style={{ fontFamily: 'Manrope', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Offering "Early Bird" rates (6 AM – 8 AM) can increase your facility occupancy by up to 20%.</p>
            </div>
          </div>
        </div>
        <div style={{ background: '#f3f4f5', borderRadius: 12, padding: 24, border: '1px solid rgba(196,198,207,0.15)' }}>
          <p style={{ fontFamily: 'Manrope', fontSize: 10, fontWeight: 700, color: '#43474e', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>Projection</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Manrope', fontSize: 13, color: '#43474e' }}>Potential Weekly Revenue</span>
              <span style={{ fontFamily: 'Lexend', fontWeight: 700, color: '#001f3f' }}>$2,450</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Manrope', fontSize: 13, color: '#43474e' }}>Hours Available</span>
              <span style={{ fontFamily: 'Lexend', fontWeight: 700, color: '#001f3f' }}>70 hrs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}