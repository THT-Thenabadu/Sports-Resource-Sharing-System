import './RegisterProgress.css';

const steps = ['Basic Info', 'Location', 'Pricing', 'Media & Amenities'];

export default function RegisterProgress({ currentStep }) {
  const percent = (currentStep / 4) * 100;

  return (
    <div className="reg-progress">
      <div className="reg-progress-top">
        <div>
          <span className="reg-step-label">
            {currentStep === 4 ? 'Final Step' : `Step ${String(currentStep).padStart(2, '0')} of 04`}
          </span>
          <h1 className="reg-step-title">{steps[currentStep - 1]}</h1>
        </div>
        <span className="reg-percent">{percent}% Complete</span>
      </div>

      {/* Bar */}
      <div className="reg-bar-track">
        <div className="reg-bar-fill" style={{ width: `${percent}%` }} />
      </div>

      {/* Step dots */}
      <div className="reg-dots">
        {steps.map((label, i) => (
          <div key={i} className={`reg-dot ${i + 1 <= currentStep ? 'reg-dot--done' : ''}`}>
            <div className="reg-dot-circle">
              {i + 1 < currentStep ? (
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className="reg-dot-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}