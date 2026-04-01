import './StepBasicInfo.css';

export default function StepBasicInfo({ data, onChange, onNext, onCancel }) {
  return (
    <div className="step-layout">

      {/* Left: Form */}
      <div className="step-form-col">
        <div className="step-card">

          <div className="step-field">
            <label className="step-label">Property Title</label>
            <input
              className="step-input"
              type="text"
              placeholder="e.g. Olympic Turf & Courts"
              value={data.title}
              onChange={e => onChange('title', e.target.value)}
            />
          </div>

          <div className="step-field">
            <label className="step-label">Description</label>
            <textarea
              className="step-input step-textarea"
              rows={4}
              placeholder="Tell athletes what makes your facility world-class..."
              value={data.description}
              onChange={e => onChange('description', e.target.value)}
            />
          </div>

          <div className="step-row">
            <div className="step-field">
              <label className="step-label">Sport Type</label>
              <div className="step-select-wrap">
                <select
                  className="step-select"
                  value={data.sportType}
                  onChange={e => onChange('sportType', e.target.value)}
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
            </div>

            <div className="step-field">
              <label className="step-label">Property Type</label>
              <div className="step-select-wrap">
                <select
                  className="step-select"
                  value={data.propertyType}
                  onChange={e => onChange('propertyType', e.target.value)}
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
            </div>
          </div>

        </div>

        {/* Nav */}
        <div className="step-nav">
          <button className="step-btn-cancel" onClick={onCancel}>
            <span className="material-symbols-outlined">close</span>
            Cancel
          </button>
          <button className="step-btn-next" onClick={onNext}>
            Next Step
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Right: Tip Image */}
      <div className="step-aside-col">
        <div className="step-aside-img-wrap">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoGxFiNYgSRTrSs-mDzyYAsgDY24lYvNyrIsHiBzmmjRK6FyiBiHDOt8DUYI_8IZPCMnt5QmuFiT8wGpXKGhMGKkDgrlk7hro0pKvf9ikI4_YUcRIbMj6xTZSguRoKncTWHKtY9nSV0xUoCWMJac34GLnya3o5Tbt9G9sDSmS07YLQBE-aJCA7xm5wSJ_EbF84caRbHFdor6rR3kXVHSeJzq2_oQ2LLm9pSrn4ahcaqL4-RyFO8c8TtWZnSYYOLbRiKHlZO0_XEW8"
            alt="Stadium"
            className="step-aside-img"
          />
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