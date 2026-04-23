'use client';
import '../component-styles/UpcomingEvents.css';

const events = [
    {
        id: 1,
        title: '5-a-side Elite Football Tournament',
        date: 'Oct 24, 2024',
        time: '09:00 AM - 06:00 PM',
        location: 'Grand Central Arena, Pitch A',
        tag: 'Main Event',
        featured: true,
        image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
    },
    {
        id: 2,
        title: 'Tennis Masters Workshop',
        date: 'Nov 02',
        time: '10:00 AM',
        location: 'Skyline Academy',
        featured: false,
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0',
    },
    {
        id: 3,
        title: 'Weekend Cricket League',
        date: 'Nov 05',
        time: '08:30 AM',
        location: 'Olympic Grounds',
        featured: false,
        image: 'https://images.unsplash.com/photo-1540747913346-19e32fc3e666',
    },
];

export default function UpcomingEvents() {
    return (
        <section className="events-section">
            <div className="events-container">

                {/* Section Header */}
                <div className="events-header">
                    <h2 className="events-title">UPCOMING EVENTS</h2>
                    <div className="events-divider" />
                </div>

                {/* Events Grid */}
                <div className="events-grid">

                    {/* Featured Event */}
                    <div className="event-card-featured">
                        <div className="event-image-wrapper-featured">
                            <img
                                src={events[0].image}
                                alt={events[0].title}
                                className="event-image"
                            />
                            <span className="event-tag">{events[0].tag}</span>
                        </div>
                        <div className="event-content-featured">
                            <div>
                                <div className="event-date-label">
                                    <span className="material-symbols-outlined">calendar_today</span>
                                    {events[0].date}
                                </div>
                                <h3 className="event-title-featured">{events[0].title}</h3>
                                <div className="event-meta">
                                    <div className="event-meta-item">
                                        <span className="material-symbols-outlined">schedule</span>
                                        {events[0].time}
                                    </div>
                                    <div className="event-meta-item">
                                        <span className="material-symbols-outlined">location_on</span>
                                        {events[0].location}
                                    </div>
                                </div>
                            </div>
                            <button className="event-btn-primary">Join Event</button>
                        </div>
                    </div>

                    {/* Small Event Cards */}
                    {events.slice(1).map((event) => (
                        <div key={event.id} className="event-card-small">
                            <div className="event-image-wrapper-small">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="event-image"
                                />
                            </div>
                            <div className="event-content-small">
                                <div>
                                    <h3 className="event-title-small">{event.title}</h3>
                                    <div className="event-meta-small">
                    <span className="event-meta-small-item">
                      <span className="material-symbols-outlined">calendar_today</span>
                        {event.date}
                    </span>
                                        <span className="event-meta-small-item">
                      <span className="material-symbols-outlined">schedule</span>
                                            {event.time}
                    </span>
                                        <span className="event-meta-small-item">
                      <span className="material-symbols-outlined">location_on</span>
                                            {event.location}
                    </span>
                                    </div>
                                </div>
                                <button className="event-btn-secondary">Join Event</button>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    );
}