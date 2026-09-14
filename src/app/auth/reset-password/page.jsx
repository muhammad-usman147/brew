"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import BrewLogo from "@/components/BrewLogo";
import AuthShowcase from "@/components/auth/AuthShowcase";
import "@/app/auth/auth.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Check if there is an active session or recovery code
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Ready for password recovery
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect after 2 seconds
      setTimeout(() => {
        const role = data?.user?.user_metadata?.role;
        if (role === "client") {
          router.push("/client/dashboard");
        } else if (role === "influencer") {
          router.push("/influencer/dashboard");
        } else {
          router.push("/auth/login");
        }
      }, 2000);
    } catch (err) {
      setError(err?.message || "Failed to update password. Please try again.");
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

          <h1 className="auth-title">Set new password</h1>
          <p className="auth-subtitle">
            {success
              ? "Your password has been successfully updated!"
              : "Create a strong new password for your account."}
          </p>

          {success ? (
            <div style={{ marginTop: "1rem", width: "100%" }}>
              <div className="auth-success-box" style={{ marginBottom: "1.25rem", display: "block" }}>
                <p style={{ margin: 0, fontWeight: 700 }}>
                  ✅ Password updated successfully!
                </p>
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", opacity: 0.9 }}>
                  Redirecting you to your dashboard...
                </p>
              </div>
              <Link
                href="/auth/login"
                className="auth-submit-btn"
                style={{ textDecoration: "none" }}
              >
                Go to Login Now
              </Link>
            </div>
          ) : (
            <form className="auth-form-body" onSubmit={handleSubmit}>
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="new-password">
                  New Password
                </label>
                <div className="auth-password-wrapper">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    className="auth-text-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
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
                <label className="auth-field-label" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <div className="auth-password-wrapper">
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    className="auth-text-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
                <div className="auth-error-box" role="alert">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="auth-submit-btn"
              >
                {loading ? "Updating password..." : "Update Password"}
              </button>
            </form>
          )}
        </div>

        <div className="auth-pane-footer">
          <p>
            Remember your password?{" "}
            <Link href="/auth/login">Back to Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Visual Showcase Pane */}
      <AuthShowcase backHref="/auth/login" />
    </main>
  );
}
