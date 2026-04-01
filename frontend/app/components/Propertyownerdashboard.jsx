import { useRouter } from 'next/navigation';
import "../components/Propertyownerdashboard.css";

export default function PropertyOwnerDashboard() {
  const router = useRouter();
  return (
    <div className="pod-main">
      {/* Page Header */}
      <div className="pod-page-header">
        <div className="pod-page-header-left">
          <nav className="pod-breadcrumb">
            <span>Account</span>
            <span className="material-symbols-outlined pod-breadcrumb-chevron">chevron_right</span>
            <span className="pod-breadcrumb-active">Properties</span>
          </nav>
          <h1 className="pod-page-title">My Properties</h1>
        </div>
        <button className="pod-btn-primary"
        onClick={() => router.push('/properties/register')}
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span>Add New Property</span>
        </button>
      </div>

      {/* Empty State Container */}
      <div className="pod-empty-container">
        <div className="pod-empty-gradient pod-empty-gradient--left" />
        <div className="pod-empty-gradient pod-empty-gradient--right" />

        <div className="pod-empty-content">
          <div className="pod-empty-card-wrap">
            <div className="pod-empty-blur pod-empty-blur--tl" />
            <div className="pod-empty-blur pod-empty-blur--br" />

            <div className="pod-empty-card">
              {/* Illustration */}
              <div className="pod-illustration">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmtccPYc3xAda7cBsbRWxYphnk9IknOHh5F5Cc5TK4TL9UoJREe9Lrr5sVOIEF-pBvmI8Ih-amH-NcHQN3R6c_Rl_mYqZ18CAZNH_dy-HOgBYaWxy122TiI6qfSIH6agjtN20_MRwoxr5usQK4bPxD4xu6U991eyhIu6cf5B8-4CI91Nih7Crc8P3KkdaLpDFAXwfxWVzjdy36O73oKsLDKdbAnyg0BKkA9GheD4IGr9n4KkuSNlnl3R1yNt3NShigRvZAhMVQABw"
                  alt="Empty stadium"
                  className="pod-illustration-img"
                />
                <div className="pod-illustration-icon-wrap">
                  <span className="material-symbols-outlined pod-illustration-icon">stadium</span>
                </div>
                <div className="pod-verified-badge">
                  <span className="material-symbols-outlined pod-verified-icon">verified</span>
                  <span className="pod-verified-label">Elite Arena</span>
                </div>
              </div>

              {/* Text */}
              <div className="pod-empty-text">
                <h2 className="pod-empty-heading">No properties registered yet</h2>
                <p className="pod-empty-description">
                  Start your journey in the Elite Arena. Listing your sports facility gives you
                  access to professional booking management and advanced performance analytics.
                </p>
              </div>

              {/* CTA */}
              <div className="pod-empty-cta">
                <button className="pod-btn-primary pod-btn-primary--lg"
                onClick={() => router.push('/properties/register')}
                >
                  <span>Register your first property</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pod-trust-badges">
                <div className="pod-trust-badge">
                  <span className="material-symbols-outlined pod-trust-icon">bolt</span>
                  <span className="pod-trust-label">Fast Approval</span>
                </div>
                <div className="pod-trust-badge">
                  <span className="material-symbols-outlined pod-trust-icon">support_agent</span>
                  <span className="pod-trust-label">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <section className="pod-help-section">
        <div className="pod-help-text">
          <h3 className="pod-help-heading">Need help getting started?</h3>
          <p className="pod-help-body">
            Our onboarding specialists are ready to help you digitize your facility. From court
            mapping to dynamic pricing structures, we've got you covered.
          </p>
          <div className="pod-help-links">
            <a href="#" className="pod-help-link">
              <span>Read the Owner Guide</span>
              <span className="material-symbols-outlined pod-help-link-icon">menu_book</span>
            </a>
            <a href="#" className="pod-help-link">
              <span>Schedule an Onboarding Call</span>
              <span className="material-symbols-outlined pod-help-link-icon">calendar_today</span>
            </a>
          </div>
        </div>

        <div className="pod-help-media">
          <div className="pod-help-video-wrap">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhd5VgQnGE0J67iJEYKzmJUZ7jd5_4c5_dYtqlrm_njpQ1-L1Evoc2Scv4h8Ss8-TPWotLtORNadweU3HH1IwPiO6D46Ck0nKcVhmOxcJjm2pAd9V3N5--gh5AeR_ya3lZjoKgS0f1-kGBGxgba5Pp-P7bNMuhWKq2kMvqPE7yQOst0wSUNE8Sn3jat4gAJN4B-VteJjqoQvOaBGhZVE7K_lEtu97x7n-Vfz47uMjBm7Ia_j54sS9xw5CuyqcKWvaClkAkK8v2fRs"
              alt="Sports management dashboard"
              className="pod-help-video-img"
            />
            <div className="pod-help-video-overlay">
              <div className="pod-play-btn">
                <span className="material-symbols-outlined pod-play-icon">play_arrow</span>
              </div>
            </div>
            <div className="pod-help-video-caption">
              <p className="pod-caption-label">Tutorial</p>
              <p className="pod-caption-text">Watch: How to list your arena in 5 minutes</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}