"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import BrewLogo from "@/components/BrewLogo";
import AuthShowcase from "@/components/auth/AuthShowcase";
import "@/app/auth/auth.css";

export default function ClientSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company_name: "",
    website: "",
    industry: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const normalizedEmail = form.email.trim().toLowerCase();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: form.password,
      options: {
        data: {
          role: "client",
          full_name: form.name,
          company_name: form.company_name,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    const profileRes = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "client",
        auth_user_id: data.user?.id,
        name: form.name,
        email: normalizedEmail,
        company_name: form.company_name,
        website: form.website,
        industry: form.industry,
      }),
    });

    const profilePayload = await profileRes.json().catch(() => ({}));

    if (!profileRes.ok) {
      setLoading(false);
      setError(
        profilePayload?.error || "Failed to create your client profile.",
      );
      return;
    }

    setLoading(false);

    if (data.session) {
      router.refresh();
      router.push("/client/dashboard");
      return;
    }

    // No session = email confirmation required
    router.push("/auth/login?verified=pending");
  };

  return (
    <main className="auth-root-layout">
      {/* Left Form Pane */}
      <div className="auth-left-pane">
        <div className="auth-form-wrapper">
          {/* Brew Brand Header */}
          <Link href="/" className="auth-brand-header" title="Go to Brew Home">
            <BrewLogo />
            <span className="auth-brand-name">Brew</span>
          </Link>

          <h1 className="auth-title">Create client account</h1>
          <p className="auth-subtitle">
            Start your brand workspace and hire vetted creators.
          </p>

          {/* Account Type Tabs */}
          <div className="auth-role-switcher" role="tablist" aria-label="Account type">
            <Link
              href="/auth/signup/client"
              className="auth-role-btn active"
              role="tab"
              aria-selected="true"
            >
              🏢 Brand / Client
            </Link>
            <Link
              href="/auth/signup/influencer"
              className="auth-role-btn"
              role="tab"
              aria-selected="false"
            >
              🎨 Influencer
            </Link>
          </div>

          <form className="auth-form-body" onSubmit={handleSubmit}>
            {/* Row 1: Name & Work Email */}
            <div className="auth-grid-2">
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="client-name">
                  Full Name
                </label>
                <input
                  id="client-name"
                  type="text"
                  placeholder="Sarah Jenkins"
                  className="auth-text-input"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="client-email">
                  Work Email
                </label>
                <input
                  id="client-email"
                  type="email"
                  placeholder="sarah@company.com"
                  className="auth-text-input"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Row 2: Password & Company Name */}
            <div className="auth-grid-2">
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="client-password">
                  Password
                </label>
                <div className="auth-password-wrapper">
                  <input
                    id="client-password"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    placeholder="Min. 8 chars"
                    className="auth-text-input"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-reveal-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="client-company">
                  Company Name
                </label>
                <input
                  id="client-company"
                  type="text"
                  placeholder="Acme Studios"
                  className="auth-text-input"
                  value={form.company_name}
                  onChange={(e) => setField("company_name", e.target.value)}
                  required
                  autoComplete="organization"
                />
              </div>
            </div>

            {/* Row 3: Website & Industry */}
            <div className="auth-grid-2">
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="client-website">
                  Website URL
                </label>
                <input
                  id="client-website"
                  type="url"
                  placeholder="https://company.com"
                  className="auth-text-input"
                  value={form.website}
                  onChange={(e) => setField("website", e.target.value)}
                  autoComplete="url"
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="client-industry">
                  Industry
                </label>
                <input
                  id="client-industry"
                  type="text"
                  placeholder="Fashion, SaaS, Lifestyle..."
                  className="auth-text-input"
                  value={form.industry}
                  onChange={(e) => setField("industry", e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="auth-error-box" role="alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="auth-success-box" role="alert">
                <span>✅</span>
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? "Creating client account..." : "Create Client Account"}
            </button>
          </form>
        </div>

        <div className="auth-pane-footer">
          <p>
            Already have an account?{" "}
            <Link href="/auth/login">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Visual Showcase Pane */}
      <AuthShowcase backHref="/" />
    </main>
  );
}
