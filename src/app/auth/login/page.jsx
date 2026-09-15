"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import BrewLogo from "@/components/BrewLogo";
import AuthShowcase from "@/components/auth/AuthShowcase";
import "@/app/auth/auth.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    // Role comes from user_metadata set during signup
    const role = data.user?.user_metadata?.role;

    // Also try profile API as fallback
    let resolvedRole = role;
    if (!resolvedRole) {
      try {
        const profileRes = await fetch(
          `/api/auth/profile?email=${encodeURIComponent(email.trim().toLowerCase())}`
        );
        const profilePayload = await profileRes.json();
        resolvedRole = profilePayload?.role;
      } catch {
        // ignore
      }
    }

    // Refresh router so middleware re-evaluates with new session cookie
    router.refresh();

    // Handle ?next= redirect
    const nextPath = new URLSearchParams(window.location.search).get("next");
    if (nextPath && nextPath.startsWith("/")) {
      router.push(nextPath);
      setLoading(false);
      return;
    }

    if (resolvedRole === "client") {
      router.push("/client/dashboard");
      setLoading(false);
      return;
    }

    if (resolvedRole === "influencer") {
      router.push("/influencer/dashboard");
      setLoading(false);
      return;
    }

    setLoading(false);
    setError(
      `Logged in but role not found (got: "${resolvedRole || "none"}"). ` +
      "Try signing up again."
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

          <h1 className="auth-title">Sign into your account</h1>
          <p className="auth-subtitle">
            New gigs and campaign briefs are waiting for you.
          </p>

          <form className="auth-form-body" onSubmit={handleSubmit}>
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                className="auth-text-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="login-password">
                Password
              </label>
              <div className="auth-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="auth-text-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
              <Link href="/auth/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="auth-error-box" role="alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? "Signing in..." : "Sign in to Brew"}
            </button>

            <p className="auth-helper-row">
              Can't sign in?{" "}
              <Link href="/auth/forgot-password">Reset password</Link>
            </p>
          </form>
        </div>

        <div className="auth-pane-footer">
          <p>
            Don't have an account?{" "}
            <Link href="/auth/signup/client">Sign up as Client</Link> or{" "}
            <Link href="/auth/signup/influencer">Influencer</Link>
          </p>
        </div>
      </div>

      {/* Right Visual Showcase Pane */}
      <AuthShowcase backHref="/" />
    </main>
  );
}
