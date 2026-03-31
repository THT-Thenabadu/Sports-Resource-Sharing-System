import '../component-styles/UserStatsCards.css';

const stats = [
    {
        label: 'Total Users',
        value: '12,482',
        badge: '+12% this month',
        badgeType: 'positive',
    },
    {
        label: 'Active Now',
        value: '843',
        badge: 'Live',
        badgeType: 'live',
    },
    {
        label: 'New Registrations',
        value: '56',
        badge: 'Today',
        badgeType: 'neutral',
        highlight: true,
    },
];

export default function UserStatsCards() {
    return (
        <div className="stats-grid">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={`stats-card ${stat.highlight ? 'stats-card--highlight' : ''}`}
                >
                    <p className="stats-label">{stat.label}</p>
                    <div className="stats-value-row">
                        <span className="stats-value">{stat.value}</span>
                        <span className={`stats-badge stats-badge--${stat.badgeType}`}>
              {stat.badgeType === 'live' && <span className="stats-live-dot" />}
                            {stat.badge}
            </span>
                    </div>
                </div>
            ))}
        </div>
    );
}