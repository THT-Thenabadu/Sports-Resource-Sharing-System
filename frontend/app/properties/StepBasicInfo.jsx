import { useState } from 'react';
import './StepBasicInfo.css';

export default function StepBasicInfo({ data, onChange, onNext, onCancel }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!data.title.trim()) newErrors.title = 'Property title is required';
    else if (data.title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!data.description.trim()) newErrors.description = 'Description is required';
    else if (data.description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters';
    if (!data.sportType) newErrors.sportType = 'Please select a sport type';
    if (!data.propertyType) newErrors.propertyType = 'Please select a property type';
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onNext();
  };

  return (
    <div className="step-layout">
      <div className="step-form-col">
        <div className="step-card">

          <div className="step-field">
            <label className="step-label">Property Title</label>
            <input
              className={`step-input ${errors.title ? 'step-input--error' : ''}`}
              type="text"
              placeholder="e.g. Olympic Turf & Courts"
              value={data.title}
              onChange={e => { onChange('title', e.target.value); setErrors(p => ({ ...p, title: '' })); }}
            />
            {errors.title && <p className="step-error">{errors.title}</p>}
          </div>

          <div className="step-field">
            <label className="step-label">Description</label>
            <textarea
              className={`step-input step-textarea ${errors.description ? 'step-input--error' : ''}`}
              rows={4}
              placeholder="Tell athletes what makes your facility world-class..."
              value={data.description}
              onChange={e => { onChange('description', e.target.value); setErrors(p => ({ ...p, description: '' })); }}
            />
            {errors.description && <p className="step-error">{errors.description}</p>}
          </div>

          <div className="step-row">
            <div className="step-field">
              <label className="step-label">Sport Type</label>
              <div className="step-select-wrap">
                <select
                  className={`step-select ${errors.sportType ? 'step-input--error' : ''}`}
                  value={data.sportType}
                  onChange={e => { onChange('sportType', e.target.value); setErrors(p => ({ ...p, sportType: '' })); }}
                >
                  <option value="">Select Sport</option>
                  <option>Football</option>
                  <option>Tennis</option>
                  <option>Cricket</option>
                  <option>Basketball</option>
                  <option>Swimming</option>
                </select>
                <span className="material-symbols-outlined step-select-icon">expand_more</span>
              </div>
              {errors.sportType && <p className="step-error">{errors.sportType}</p>}
            </div>

            <div className="step-field">
              <label className="step-label">Property Type</label>
              <div className="step-select-wrap">
                <select
                  className={`step-select ${errors.propertyType ? 'step-input--error' : ''}`}
                  value={data.propertyType}
                  onChange={e => { onChange('propertyType', e.target.value); setErrors(p => ({ ...p, propertyType: '' })); }}
                >
                  <option value="">Select Type</option>
                  <option>Turf</option>
                  <option>Court</option>
                  <option>Ground</option>
                  <option>Pool</option>
                  <option>Gym</option>
                </select>
                <span className="material-symbols-outlined step-select-icon">expand_more</span>
              </div>
              {errors.propertyType && <p className="step-error">{errors.propertyType}</p>}
            </div>
          </div>

        </div>

        <div className="step-nav">
          <button className="step-btn-cancel" onClick={onCancel}>
            <span className="material-symbols-outlined">close</span>
            Cancel
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
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoGxFiNYgSRTrSs-mDzyYAsgDY24lYvNyrIsHiBzmmjRK6FyiBiHDOt8DUYI_8IZPCMnt5QmuFiT8wGpXKGhMGKkDgrlk7hro0pKvf9ikI4_YUcRIbMj6xTZSguRoKncTWHKtY9nSV0xUoCWMJac34GLnya3o5Tbt9G9sDSmS07YLQBE-aJCA7xm5wSJ_EbF84caRbHFdor6rR3kXVHSeJzq2_oQ2LLm9pSrn4ahcaqL4-RyFO8c8TtWZnSYYOLbRiKHlZO0_XEW8" alt="Stadium" className="step-aside-img" />
          <div className="step-aside-overlay" />
          <div className="step-aside-badge">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: '#005eb2', fontSize: 14 }}>verified</span>
            <span>Elite Verified</span>
          </div>
          <div className="step-aside-text">
            <h3>Setting the Stage for Success</h3>
            <p>High-performing properties usually have titles that mention the sport and location. Keep your description action-oriented to attract competitive teams.</p>
          </div>
        </div>
      </div>
    </div>
  );
}