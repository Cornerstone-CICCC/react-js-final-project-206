import React, { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import api from "../lib/api";
import { TOKEN_STORAGE_KEY, useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

/** ✅ 백엔드 붙이면 false로 */
const USE_MOCK = true;

type LoginFormState = {
  email: string;
  password: string;
  remember: boolean;
};

type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    partnerId?: string | null;
  };
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuth } = useAuth();

  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
    remember: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 이미 로그인 상태면 접근 막기
  // if (auth.token) {
  //   if (auth.user?.partnerId) return <Navigate to="/dashboard" replace />;
  //   if (auth.user && !auth.user.partnerId) return <Navigate to="/dashboard" replace />;
  //   return <Navigate to="/dashboard" replace />;
  // }

  const canSubmit = useMemo(() => {
    const emailOk = form.email.trim().length > 0;
    const passwordOk = form.password.trim().length >= 6;
    return emailOk && passwordOk && !isSubmitting;
  }, [form.email, form.password, isSubmitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveToken = (token: string, remember: boolean) => {
    if (remember) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  };

  const normalizeError = (err: unknown) => {
    if (typeof err === "object" && err !== null) {
      // @ts-expect-error
      const msg = err?.response?.data?.message;
      if (typeof msg === "string") return msg;
      // @ts-expect-error
      const status = err?.response?.status;
      if (status === 401) return "Invalid email or password.";
    }
    return "An error occurred during login.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);

      const payload = {
        email: form.email.trim(),
        password: form.password,
      };

      if (USE_MOCK) {
  await new Promise((r) => setTimeout(r, 350));
  const fakeToken = "mock_token_" + Math.random().toString(36).slice(2);

  // ✅ mock은 무조건 partnerId 있다고 가정 (어디서 partner gate를 걸어도 안 튕기게)
  const fakeUser = {
    id: "mock_user_id",
    email: payload.email,
    partnerId: "mock_partner_id",
  };

  saveToken(fakeToken, form.remember);
  setAuth({ token: fakeToken, user: fakeUser });

  // ✅ from을 쓰더라도 invite/login/signup는 무시하고 dashboard로 보냄
  const from = (location.state as any)?.from as string | undefined;
  const safeFrom =
    from && !["/invite", "/login", "/signup"].includes(from) ? from : undefined;

  navigate(safeFrom ?? "/dashboard", { replace: true });
  return;
}


      const { data } = await api.post<LoginResponse>("/auth/login", payload);

      saveToken(data.token, form.remember);
      setAuth({ token: data.token, user: data.user });

      const from = (location.state as any)?.from as string | undefined;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      if (data.user.partnerId) navigate("/dashboard", { replace: true });
      else navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = normalizeError(err);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <aside style={styles.left}>
          <div style={{ width: "100%" }}>
            <h1 style={styles.brand}>F-insight</h1>
            <p style={styles.tagline}>AI Financial Management Platform</p>
            <div style={styles.divider} />

            <ul style={styles.featureList}>
              <li style={styles.featureItem}>
                <span style={styles.iconCircle} aria-hidden>
                  📊
                </span>
                <div>
                  <div style={styles.featureTitle}>Real-time Analytics</div>
                  <div style={styles.featureDesc}>
                    Track your finances with AI-powered insights and predictions
                  </div>
                </div>
              </li>

              <li style={styles.featureItem}>
                <span style={styles.iconCircle} aria-hidden>
                  🔒
                </span>
                <div>
                  <div style={styles.featureTitle}>Secure &amp; Private</div>
                  <div style={styles.featureDesc}>
                    Bank-level encryption keeps your financial data safe
                  </div>
                </div>
              </li>

              <li style={styles.featureItem}>
                <span style={styles.iconCircle} aria-hidden>
                  ⚡
                </span>
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

        <main style={styles.right}>
          <div style={styles.formWrap}>
            <h2 style={styles.title}>Welcome back</h2>
            <p style={styles.subtitle}>Sign in to your account to continue</p>

            {errorMsg && (
              <div role="alert" style={styles.errorBox}>
                {errorMsg}
              </div>
            )}

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
                <input
                  style={styles.input}
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
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

                <Link to="/forgot-password" style={styles.linkSmall}>
                  Forgot password?
                </Link>
              </div>

              <button type="submit" style={styles.primaryBtn} disabled={!canSubmit}>
                {isSubmitting ? "Signing In..." : "Sign In"}
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    background: "#f5f7fb",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
  },

  card: {
    width: "min(1100px, 100%)",
    minHeight: "640px",
    borderRadius: "14px",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "1.05fr 1fr",
    background: "#ffffff",
    boxShadow: "0 18px 40px rgba(10, 20, 40, 0.12)",
  },

  left: {
    padding: "48px 44px",
    color: "#ffffff",
    background:
      "linear-gradient(135deg, #1f6bff 0%, #1c57f2 40%, #1b4fe8 100%)",
    display: "flex",
    alignItems: "center",
  },

  brand: {
    margin: 0,
    fontSize: "34px",
    letterSpacing: "-0.5px",
    fontWeight: 800,
  },

  tagline: {
    margin: "10px 0 0",
    fontSize: "14px",
    opacity: 0.9,
  },

  divider: {
    width: "56px",
    height: "2px",
    background: "rgba(255,255,255,0.65)",
    margin: "22px 0 28px",
    borderRadius: "999px",
  },

  featureList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: "22px",
  },

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
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
    fontSize: "18px",
  },

  featureTitle: {
    fontWeight: 700,
    marginBottom: "6px",
    fontSize: "14px",
  },

  featureDesc: {
    fontSize: "12px",
    lineHeight: 1.45,
    opacity: 0.88,
    maxWidth: "360px",
  },

  right: {
    padding: "48px 44px",
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

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 800,
    letterSpacing: "-0.3px",
    color: "#0f172a",
  },

  subtitle: {
    margin: "10px 0 24px",
    fontSize: "13px",
    color: "#64748b",
  },

  errorBox: {
    width: "100%",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: "10px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "14px",
  },

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

  checkbox: {
    width: "14px",
    height: "14px",
  },

  linkSmall: {
    fontSize: "12px",
    color: "#1f6bff",
    textDecoration: "none",
    fontWeight: 700,
  },

  primaryBtn: {
    width: "100%",
    height: "44px",
    borderRadius: "10px",
    border: "none",
    background: "#1f6bff",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(31,107,255,0.25)",
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

  orLine: {
    height: "1px",
    background: "#e5e7eb",
  },

  orText: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 700,
  },

  terms: {
    marginTop: "16px",
    fontSize: "11px",
    color: "#94a3b8",
    lineHeight: 1.5,
    textAlign: "center",
    width: "100%",
  },

  inlineLink: {
    color: "#1f6bff",
    textDecoration: "none",
    fontWeight: 700,
  },
};
