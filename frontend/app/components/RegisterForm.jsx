import { useState } from "react";
import "../component-styles/RegisterForm.css";

// ── Eye Icons ────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
    </svg>
  );

// ── Reusable: Password Input ─────────────────────────────────────────────────
function PasswordInput({ name, placeholder, value, onChange, show, onToggle }) {
  return (
    <div className="password-wrapper">
      <input
        className="form-input password-input"
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      <button
        type="button"
        className="password-toggle"
        onClick={onToggle}
        aria-label="Toggle password visibility"
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

// ── Reusable: Form Field ─────────────────────────────────────────────────────
function FormField({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const userData = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: "customer",
    };

    try {
      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! You can now log in.");
        // window.location.href = "/login";
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Could not connect to the server. Is your backend running?");
    }
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
          {/* Full Name */}
          <FormField label="Full Name">
            <input
              className="form-input"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </FormField>

          {/* Email */}
          <FormField label="Email Address">
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormField>

          {/* Password */}
          <FormField label="Password">
            <PasswordInput
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              show={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
            />
          </FormField>

          {/* Confirm Password */}
          <FormField label="Confirm Password">
            <PasswordInput
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
            />
          </FormField>

          {/* Actions */}
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