"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import BrewLogo from "@/components/BrewLogo";
import AuthShowcase from "@/components/auth/AuthShowcase";
import "@/app/auth/auth.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo }
      );

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      setError(err?.message || "Failed to send reset link. Please try again.");
      setLoading(false);
    }
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

          <h1 className="auth-title">Reset your password</h1>
          <p className="auth-subtitle">
            {submitted
              ? "Recovery instructions have been dispatched to your inbox."
              : "Enter your email to receive password reset instructions."}
          </p>

          {submitted ? (
            <div style={{ marginTop: "1rem", width: "100%" }}>
              <div className="auth-success-box" style={{ marginBottom: "1.25rem", display: "block" }}>
                <p style={{ margin: 0, fontWeight: 700 }}>
                  ✉️ Reset link sent to {email}
                </p>
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", opacity: 0.9 }}>
                  Click the link in your email to choose a new password. Check your spam folder if it doesn't arrive shortly.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <button
                  type="button"
                  className="auth-submit-btn"
                  style={{ background: "#4b5563" }}
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                >
                  Try a different email
                </button>
                <Link
                  href="/auth/login"
                  className="auth-submit-btn"
                  style={{ textDecoration: "none" }}
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form className="auth-form-body" onSubmit={handleSubmit}>
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="recovery-email">
                  Registered Email Address
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  placeholder="Enter your email"
                  className="auth-text-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className="auth-error-box" role="alert">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="auth-submit-btn"
              >
                {loading ? "Sending reset link..." : "Send Reset Link"}
              </button>

              <p className="auth-helper-row">
                Remember your password?{" "}
                <Link href="/auth/login">Back to Sign in</Link>
              </p>
            </form>
          )}
        </div>

        <div className="auth-pane-footer">
          <p>
            Need an account?{" "}
            <Link href="/auth/signup/client">Sign up as Client</Link> or{" "}
            <Link href="/auth/signup/influencer">Influencer</Link>
          </p>
        </div>
      </div>

      {/* Right Visual Showcase Pane */}
      <AuthShowcase backHref="/auth/login" />
    </main>
  );
}
