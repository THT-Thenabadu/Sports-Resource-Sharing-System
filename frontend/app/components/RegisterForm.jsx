import { useState } from "react";
import "../component-styles/RegisterForm.css";

export default function RegisterForm() {
  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    businessName: "",
    businessRegId: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Register submitted:", { role, ...formData });
    // Add your register logic here
  };

  return (
    <main className="register-main">
      <div className="register-container">
        {/* Header */}
        <div className="register-header">
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">
            Join the Sportek community and track your performance.
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Role Toggle */}
          <div className="form-group">
            <label className="form-label">Register as</label>
            <div className="role-toggle-group">
              <button
                type="button"
                className={`role-btn ${role === "customer" ? "role-btn--active" : ""}`}
                onClick={() => setRole("customer")}
              >
                I am a Customer
              </button>
              <button
                type="button"
                className={`role-btn ${role === "owner" ? "role-btn--active" : ""}`}
                onClick={() => setRole("owner")}
              >
                I am a Property Owner
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Owner-Specific Fields */}
          {role === "owner" && (
            <div className="owner-fields">
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input
                  className="form-input"
                  type="text"
                  name="businessName"
                  placeholder="Enter your business name"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Business Registration ID</label>
                <input
                  className="form-input"
                  type="text"
                  name="businessRegId"
                  placeholder="Enter registration ID"
                  value={formData.businessRegId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                className="form-input password-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="password-wrapper">
              <input
                className="form-input password-input"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label="Toggle confirm password visibility"
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button className="submit-btn" type="submit">
              Create Account
            </button>
            <a className="back-btn" href="/login">
              Back to Login
            </a>
          </div>
        </form>

        {/* Terms */}
        <p className="terms-text">
          By signing up, you agree to our{" "}
          <a className="terms-link" href="#">Terms</a> and{" "}
          <a className="terms-link" href="#">Privacy</a>.
        </p>
      </div>
    </main>
  );
}