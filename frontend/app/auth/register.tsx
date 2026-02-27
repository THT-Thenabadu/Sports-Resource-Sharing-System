"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type UserType = "owner" | "customer";

export default function SignUpPage() {
  const [userType, setUserType] = useState<UserType>("owner");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required.";
    if (!formData.email.trim()) e.email = "Email is required.";
    if (formData.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (!formData.terms) e.terms = "You must accept the terms.";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: userType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");
      // TODO: redirect or store token
      alert("Account created successfully!");
    } catch (err: unknown) {
      setErrors({ api: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  const userTypeOptions: { value: UserType; icon: string; label: string }[] = [
    { value: "owner", icon: "domain", label: "Property Owner" },
    { value: "customer", icon: "person", label: "Customer" },
  ];

  return (
    <div className="flex min-h-screen w-full font-display">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOa_PyFs3EvUaap5glh5rIGfssuAoeRpIWdrZoUWK8rXrgQdz-XzK_htb9Dc3zsArcQe0acnS9K8Zlt_sKb0glKjg6xPuZ43uNmOKsIANRI7omWdWqYj0RHXOWGp1HLovbBui3nr6zau0QfEpVXfzYC01NDYs3-BLsI61QcFjV6uBcRWQQC2Qv0bGLgeM6VjPfNlxLsBXVdwBUtc9m0WMB3KOw-_prF0-aLVo7_xG2tox7MrrRFx_TE-yS4OGMCz5J73KgUihbVVo"
          alt="Wide outdoor sports stadium at dusk"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/40 flex flex-col justify-between p-16">
          <div className="flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-4xl font-bold">sports_handball</span>
            <h1 className="text-3xl font-extrabold tracking-tight">Sportek</h1>
          </div>
          <div className="max-w-md">
            <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Join the global sports community.
            </h2>
            <p className="text-white/80 text-lg font-light leading-relaxed">
              Streamline your facility management or find your next game. Sportek brings property owners and athletes together in one seamless platform.
            </p>
          </div>
          <div className="text-white/60 text-sm">
            © 2024 Sportek Systems Inc. All rights reserved.
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white dark:bg-background-dark">
        <div className="w-full max-w-md space-y-8">

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create an account
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>

          {/* API error */}
          {errors.api && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {errors.api}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* User Type Toggle */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Are you a Property Owner or a Customer?
              </label>
              <div className="grid grid-cols-2 gap-4">
                {userTypeOptions.map(({ value, icon, label }) => {
                  const selected = userType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setUserType(value)}
                      className={`border-2 p-4 rounded-xl transition-all flex flex-col items-center gap-3 text-center cursor-pointer ${
                        selected
                          ? "border-primary bg-primary/5 shadow-[0_0_0_1px_#135bec]"
                          : "border-slate-100 dark:border-slate-800 hover:border-primary/50"
                      }`}
                    >
                      <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${
                        selected
                          ? "bg-primary text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                      }`}>
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                      </div>
                      <span className="text-sm font-bold">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="full-name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">person</span>
                  <input
                    id="full-name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm transition-all outline-none"
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">mail</span>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm transition-all outline-none"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">lock</span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">lock_reset</span>
                    <input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showConfirm ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                </div>

              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400 leading-tight cursor-pointer">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs -mt-4">{errors.terms}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>

            {/* Footer links */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="flex items-center gap-4 w-full text-slate-400">
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow" />
                <span className="text-xs font-bold uppercase tracking-widest">Help &amp; Support</span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow" />
              </div>
              <div className="flex gap-6 text-xs text-slate-500 dark:text-slate-400">
                {["Terms of Service", "Privacy Policy", "Support Center"].map((item) => (
                  <Link key={item} href="#" className="hover:text-primary transition-colors">
                    {item}
                  </Link>
                ))}
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}