import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@/types";
import { setSession } from "@/lib/session";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<UserRole>("investor");
  const navigate = useNavigate();

  const handleSendOtp = () => {
    if (phone.length === 10) {
      setOtpSent(true);
    }
  };

  const handleVerify = () => {
    if (otp.length === 6) {
      if (role === "ops") {
        setSession({ role: "ops" });
        navigate("/admin/ifas");
      } else if (role === "ifa") {
        setSession({ role: "ifa", userId: "ifa1" });
        navigate("/ifa/investors");
      } else {
        setSession({ role: "investor", userId: "inv1" });
        navigate("/dashboard");
      }
    }
  };

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
            <h1>Login</h1>
            <p>Enter your mobile number to access your account</p>
          </header>

          <div className="login-card">
            <div className="card-head">
              <span className="card-label">Login as (Demo)</span>
              <div className="role-buttons">
                {(["investor", "ifa", "ops"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`role-button ${role === r ? "role-active" : "role-inactive"}`}
                  >
                    {r === "ifa" ? "IFA" : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-body">
              <div className="form-group">
                <Label htmlFor="phone" className="form-label">
                  Mobile Number
                </Label>
                <div className="phone-field">
                  <span className="phone-prefix">+91</span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Mobile Number"
                    maxLength={10}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
                    className="phone-input"
                  />
                </div>
              </div>

              {!otpSent ? (
                <Button
                  className="primary-button"
                  disabled={phone.length !== 10}
                  onClick={handleSendOtp}
                >
                  Send OTP
                </Button>
              ) : (
                <div className="otp-area">
                  <div className="form-group">
                    <Label htmlFor="otp" className="form-label">
                      Enter OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="6-digit OTP"
                      maxLength={6}
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                      className="otp-input"
                    />
                    <p className="otp-note">
                      OTP sent to <span className="otp-phone">+91 {phone}</span>{" "}
                      <button type="button" className="link-button">
                        Resend
                      </button>
                    </p>
                  </div>
                  <Button
                    className="primary-button"
                    disabled={otp.length !== 6}
                    onClick={handleVerify}
                  >
                    Verify & Login
                  </Button>
                </div>
              )}
            </div>
          </div>

          <p className="footer-note">
            By continuing, you agree to Sell Flow Terms &amp; Privacy Policy.
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
