"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import BrewLogo from "@/components/BrewLogo";
import AuthShowcase from "@/components/auth/AuthShowcase";
import "@/app/auth/auth.css";

export default function InfluencerSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
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
          role: "influencer",
          full_name: form.name,
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
        role: "influencer",
        auth_user_id: data.user?.id,
        name: form.name,
        email: normalizedEmail,
        phone: form.phone,
        bio: form.bio,
      }),
    });

    const profilePayload = await profileRes.json().catch(() => ({}));

    if (!profileRes.ok) {
      setLoading(false);
      setError(
        profilePayload?.error || "Failed to create your influencer profile.",
      );
      return;
    }

    setLoading(false);

    if (data.session) {
      router.push("/influencer/dashboard");
      return;
    }

    setSuccess(
      "Account created. Please check your email to verify your account, then log in.",
    );
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

          <h1 className="auth-title">Create creator account</h1>
          <p className="auth-subtitle">
            Join Brew to land sponsorship deals and monetize your reach.
          </p>

          {/* Account Type Tabs */}
          <div className="auth-role-switcher" role="tablist" aria-label="Account type">
            <Link
              href="/auth/signup/client"
              className="auth-role-btn"
              role="tab"
              aria-selected="false"
            >
              🏢 Brand / Client
            </Link>
            <Link
              href="/auth/signup/influencer"
              className="auth-role-btn active"
              role="tab"
              aria-selected="true"
            >
              🎨 Influencer
            </Link>
          </div>

          <form className="auth-form-body" onSubmit={handleSubmit}>
            {/* Row 1: Name & Email */}
            <div className="auth-grid-2">
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="inf-name">
                  Full Name
                </label>
                <input
                  id="inf-name"
                  type="text"
                  placeholder="Alex Morgan"
                  className="auth-text-input"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="inf-email">
                  Email Address
                </label>
                <input
                  id="inf-email"
                  type="email"
                  placeholder="alex@creator.com"
                  className="auth-text-input"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Row 2: Password & Phone */}
            <div className="auth-grid-2">
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="inf-password">
                  Password
                </label>
                <div className="auth-password-wrapper">
                  <input
                    id="inf-password"
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
                <label className="auth-field-label" htmlFor="inf-phone">
                  Phone Number
                </label>
                <input
                  id="inf-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="auth-text-input"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Row 3: Bio */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="inf-bio">
                Short Bio / Content Niche
              </label>
              <textarea
                id="inf-bio"
                rows={2}
                placeholder="Describe your audience, main platforms, and content style..."
                className="auth-text-input"
                style={{ borderRadius: "8px", resize: "none" }}
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
              />
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
              {loading ? "Creating creator account..." : "Create Influencer Account"}
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
