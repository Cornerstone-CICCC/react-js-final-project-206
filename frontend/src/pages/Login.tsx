// frontend/src/pages/login.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

type LoginFormState = {
  email: string;
  password: string;
  remember: boolean;
};

type LoginBackendResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
};

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuth, setUser } = useAuth();

  const isMobile = useIsMobile(640);
  const styles = useMemo(() => makeStyles({ isMobile }), [isMobile]);

  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
    remember: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ password show/hide
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = useMemo(() => {
    const emailOk = form.email.trim().length > 0;
    const passwordOk = form.password.trim().length > 0;
    return emailOk && passwordOk && !isSubmitting;
  }, [form.email, form.password, isSubmitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const normalizeError = (err: any) => {
    const msg = err?.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;

    const status = err?.response?.status;
    if (status === 401) return "Incorrect email or password!";
    if (status === 404) return "Login endpoint not found. Check API route.";
    return "An error occurred during login.";
  };

  const safeRedirectAfterLogin = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);

      const payload = {
        email: form.email.trim(),
        password: form.password,
      };

      const { data } = await api.post<LoginBackendResponse>("/users/login", payload);

      setUser({
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
      });

      await refreshAuth();

      toast.success(data.message ?? "Login successful!");
      safeRedirectAfterLogin();
    } catch (err) {
      toast.error(normalizeError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {!isMobile && (
          <aside style={styles.left}>
            <div style={{ width: "100%" }}>
              <h1 style={styles.brand}>F-insight</h1>
              <p style={styles.tagline}>AI Financial Management Platform</p>
              <div style={styles.divider} />

              <ul style={styles.featureList}>
                <li style={styles.featureItem}>
                  <span style={styles.iconCircle}>📊</span>
                  <div>
                    <div style={styles.featureTitle}>Real-time Analytics</div>
                    <div style={styles.featureDesc}>
                      Track your finances with AI-powered insights and predictions
                    </div>
                  </div>
                </li>

                <li style={styles.featureItem}>
                  <span style={styles.iconCircle}>🔒</span>
                  <div>
                    <div style={styles.featureTitle}>Secure &amp; Private</div>
                    <div style={styles.featureDesc}>
                      Bank-level encryption keeps your financial data safe
                    </div>
                  </div>
                </li>

                <li style={styles.featureItem}>
                  <span style={styles.iconCircle}>⚡</span>
                  <div>
                    <div style={styles.featureTitle}>Smart Automation</div>
                    <div style={styles.featureDesc}>
                      Automate bill payments and savings with intelligent algorithms
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        )}

        <main style={styles.right}>
          <div style={styles.formWrap}>
            <h2 style={styles.title}>Welcome back</h2>
            <p style={styles.subtitle}>Log in to your account to continue</p>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <label style={styles.label}>
                Email
                <input
                  style={styles.input}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label style={styles.label}>
                Password
                <div style={styles.pwWrap}>
                  <input
                    style={styles.pwInput}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={styles.pwToggle}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <div style={styles.rowBetween}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  Remember me
                </label>
              </div>

              <button type="submit" style={styles.primaryBtn} disabled={!canSubmit}>
                {isSubmitting ? "Logging In..." : "Log In"}
              </button>

              <div style={styles.orWrap}>
                <div style={styles.orLine} />
                <span style={styles.orText}>or</span>
                <div style={styles.orLine} />
              </div>

              <Link to="/signup" style={styles.secondaryLink}>
                Sign Up
              </Link>

              <p style={styles.terms}>
                By continuing, you agree to our{" "}
                <a href="#" style={styles.inlineLink}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" style={styles.inlineLink}>
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

function makeStyles({ isMobile }: { isMobile: boolean }): Record<string, React.CSSProperties> {
  return {
    page: {
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: isMobile ? 14 : 24,
      background: "#0F1115",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    },

    card: {
      width: "min(1100px, 100%)",
      minHeight: isMobile ? "auto" : "640px",
      borderRadius: isMobile ? 16 : 14,
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.05fr 1fr",
      background: "#ffffff",
      boxShadow: "0 18px 40px rgba(10, 20, 40, 0.12)",
    },

    left: {
      padding: "48px 44px",
      color: "#ffffff",
      background: "linear-gradient(135deg, #1f6bff 0%, #1c57f2 40%, #1b4fe8 100%)",
      display: "flex",
      alignItems: "center",
    },

    brand: { margin: 0, fontSize: "34px", fontWeight: 800 },
    tagline: { margin: "10px 0 0", fontSize: "14px", opacity: 0.9 },

    divider: {
      width: "56px",
      height: "2px",
      background: "rgba(255,255,255,0.65)",
      margin: "22px 0 28px",
      borderRadius: "999px",
    },

    featureList: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "22px" },
    featureItem: {
      display: "grid",
      gridTemplateColumns: "44px 1fr",
      gap: "14px",
      alignItems: "start",
    },
    iconCircle: {
      width: "40px",
      height: "40px",
      borderRadius: "12px",
      display: "grid",
      placeItems: "center",
      background: "rgba(255,255,255,0.16)",
      fontSize: "18px",
    },
    featureTitle: { fontWeight: 700, marginBottom: "6px", fontSize: "14px" },
    featureDesc: { fontSize: "12px", lineHeight: 1.45, opacity: 0.88 },

    right: {
      padding: isMobile ? "26px 18px" : "48px 44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#ffffff",
    },

    formWrap: {
      width: "min(420px, 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },

    title: { margin: 0, fontSize: isMobile ? "26px" : "30px", fontWeight: 800 },

    subtitle: { margin: "10px 0 24px", fontSize: "13px", color: "#64748b" },

    label: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      fontSize: "12px",
      color: "#334155",
      fontWeight: 600,
      marginBottom: "16px",
    },

    input: {
      width: "100%",
      height: "44px",
      borderRadius: "10px",
      border: "1px solid #e5e7eb",
      background: "#f8fafc",
      padding: "0 14px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    },

    // ✅ password toggle styles
    pwWrap: {
      position: "relative",
      width: "100%",
      display: "flex",
      alignItems: "center",
    },

    pwInput: {
      width: "100%",
      height: "44px",
      borderRadius: "10px",
      border: "1px solid #e5e7eb",
      background: "#f8fafc",
      padding: "0 72px 0 14px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    },

    pwToggle: {
      position: "absolute",
      right: 10,
      height: 30,
      padding: "0 10px",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      background: "#ffffff",
      fontWeight: 800,
      fontSize: 12,
      cursor: "pointer",
    },

    rowBetween: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      marginTop: "4px",
      marginBottom: "18px",
    },

    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
      color: "#475569",
      fontWeight: 600,
    },

    checkbox: { width: "14px", height: "14px" },

    primaryBtn: {
      width: "100%",
      height: "44px",
      borderRadius: "10px",
      border: "none",
      background: "#1f6bff",
      color: "#ffffff",
      fontWeight: 800,
      cursor: "pointer",
    },

    secondaryLink: {
      width: "100%",
      height: "44px",
      borderRadius: "10px",
      background: "#e8f0ff",
      color: "#1f6bff",
      fontWeight: 800,
      display: "grid",
      placeItems: "center",
      textDecoration: "none",
    },

    orWrap: {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      gap: "12px",
      margin: "18px 0",
    },

    orLine: { height: "1px", background: "#e5e7eb" },
    orText: { fontSize: "12px", color: "#94a3b8", fontWeight: 700 },

    terms: {
      marginTop: "16px",
      fontSize: "11px",
      color: "#94a3b8",
      lineHeight: 1.5,
      textAlign: "center",
      width: "100%",
    },

    inlineLink: { color: "#1f6bff", textDecoration: "none", fontWeight: 700 },
  };
}
