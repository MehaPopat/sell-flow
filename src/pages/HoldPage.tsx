import { Button } from "@/components/ui/button";

export default function HoldPage() {
  return (
    <div className="login-page">
      <header className="login-header-bar">
        <div className="login-header-inner">
          <div className="brand-group">
            <span className="brand-icon" />
            <div>
              <p className="brand-title">Sell Flow</p>
              <p className="brand-subtitle">Fast access for your portal</p>
            </div>
          </div>

          <nav className="header-nav">
            <a href="#" className="nav-link">
              Home
            </a>
            <a href="#" className="nav-link">
              How this works
            </a>
          </nav>

          <Button className="button sign-up-button">Sign Up</Button>
        </div>
      </header>

      <main className="login-main">
        <section className="login-panel">
          <header className="panel-top">
            <h1>Account on Hold</h1>
            <p>Your account has been placed on hold. Please contact support to resolve this.</p>
          </header>

          <div className="login-card">
            <div className="hold-icon-wrap">
              <div className="hold-icon" />
            </div>

            <div className="hold-body">
              <p className="hold-message">
                Your access has been temporarily suspended. This may be due to a pending verification
                or a compliance review. Our team will reach out to you shortly.
              </p>

              <div className="hold-actions">
                <Button className="primary-button" onClick={() => (window.location.href = "/")}>
                  Back to Login
                </Button>
                <a href="mailto:support@sellflow.in" className="hold-support-link">
                  Contact Support
                </a>
              </div>
            </div>
          </div>

          <p className="footer-note">
            For urgent queries, email us at{" "}
            <span className="otp-phone">support@sellflow.in</span>
          </p>
        </section>
      </main>

      <footer className="login-footer">
        <div className="footer-grid">
          <div>
            <p className="footer-title">Sell Flow</p>
            <p className="footer-copy">
              Your trusted partner for simplified sell flow access and secure portfolio management.
            </p>
          </div>

          <div>
            <p className="footer-title">Terms &amp; Compliance</p>
            <ul className="footer-links">
              <li>Terms &amp; Conditions</li>
              <li>Privacy Policy</li>
              <li>Investor Charter</li>
              <li>KYC Details</li>
            </ul>
          </div>

          <div>
            <p className="footer-title">Contact Us</p>
            <p className="footer-copy">Customer Support</p>
            <p className="footer-copy">support@sellflow.in</p>
            <p className="footer-copy">Get in Touch</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
