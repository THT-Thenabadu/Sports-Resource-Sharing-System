import './AdminTipCard.css';

export default function AdminTipCard() {
    return (
        <div className="tip-card">
            {/* Decorative blur orb */}
            <div className="tip-orb" />

            <div className="tip-content">
                <span className="tip-label">Admin Tip</span>
                <h4 className="tip-title">Automated Role Escalation</h4>
                <p className="tip-description">
                    Property owners who maintain a 4.8+ rating for 6 months are eligible for
                    "Elite Partner" status automatically.
                </p>
                <button className="tip-btn">Configure Rules</button>
            </div>
        </div>
    );
}