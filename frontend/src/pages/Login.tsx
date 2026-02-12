<<<<<<< HEAD
import React, { useMemo, useState } from "react";
=======
// frontend/src/pages/login.tsx
import React, { useEffect, useMemo, useState } from "react";
>>>>>>> origin/feature/backend-env
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../lib/api";
<<<<<<< HEAD
import { TOKEN_STORAGE_KEY, useAuth } from "../contexts/AuthContext";

/** ✅ 백엔드 붙이면 false로 */
const USE_MOCK = true;

/** ✅ Signup(mock) 저장소 키 (Signup.tsx의 mockAuth.ts가 쓰는 키랑 맞춰야 함) */
const MOCK_USERS_KEY = "mock_users_v1";
const PROFILE_STORAGE_KEY = "mock_profile_v1";
=======
import { useAuth } from "../context/AuthContext";
>>>>>>> origin/feature/backend-env

type LoginFormState = {
  email: string;
  password: string;
<<<<<<< HEAD
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

type MockUser = {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  partnerId?: string | null;
};

function readMockUsers(): MockUser[] {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MockUser[]) : [];
  } catch {
    return [];
  }
}

function writeMockProfile(u: MockUser) {
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      email: u.email,
    })
  );
=======
  remember: boolean; // UI 유지용(세션에선 의미 없음, 남겨둬도 OK)
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

// ✅ 반응형: 모바일만 판별 (요청대로 모바일에서 left 숨김)
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
>>>>>>> origin/feature/backend-env
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
<<<<<<< HEAD
  const { setAuth } = useAuth();
=======
  const { refreshAuth, setUser } = useAuth();

  const isMobile = useIsMobile(640);
  const styles = useMemo(() => makeStyles({ isMobile }), [isMobile]);
>>>>>>> origin/feature/backend-env

  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
    remember: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const emailOk = form.email.trim().length > 0;
<<<<<<< HEAD
    const passwordOk = form.password.trim().length >= 6;
=======
    const passwordOk = form.password.trim().length > 0;
>>>>>>> origin/feature/backend-env
    return emailOk && passwordOk && !isSubmitting;
  }, [form.email, form.password, isSubmitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

<<<<<<< HEAD
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
=======
  const normalizeError = (err: any) => {
    const msg = err?.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;

    const status = err?.response?.status;
    if (status === 401) return "Incorrect email or password!";
    if (status === 404) return "Login endpoint not found. Check API route.";
>>>>>>> origin/feature/backend-env
    return "An error occurred during login.";
  };

  const safeRedirectAfterLogin = () => {
    const from = (location.state as any)?.from as string | undefined;
    const blocked = ["/login", "/signup", "/invite"];
    const safeFrom = from && !blocked.includes(from) ? from : undefined;
    navigate(safeFrom ?? "/dashboard", { replace: true });
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

<<<<<<< HEAD
      // =========================
      // ✅ MOCK LOGIN
      // =========================
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 250));

        const users = readMockUsers();
        const found = users.find(
          (u) => u.email.toLowerCase() === payload.email.toLowerCase()
        );

        if (!found) {
          toast.error("No account found with this email. Please sign up first.");
          return;
        }

        if (found.password !== payload.password) {
          toast.error("Invalid email or password.");
          return;
        }

        const token = "mock_token_" + Math.random().toString(36).slice(2);

        // ✅ partner gate가 있어도 안 튕기게: mock은 partnerId 항상 있다고 처리
        const userForAuth = {
          id: found.id,
          email: found.email,
          partnerId: found.partnerId ?? "mock_partner_id",
        };

        saveToken(token, form.remember);
        setAuth({ token, user: userForAuth });

        // ✅ Profile 페이지가 채워지도록 mock_profile_v1 생성/갱신
        writeMockProfile(found);

        safeRedirectAfterLogin();
        return;
      }

      // =========================
      // ✅ REAL API LOGIN
      // =========================
      const { data } = await api.post<LoginResponse>("/auth/login", payload);

      saveToken(data.token, form.remember);
      setAuth({ token: data.token, user: data.user });

=======
      const { data } = await api.post<LoginBackendResponse>("/users/login", payload);

      setUser({
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
      });

      await refreshAuth();

      toast.success(data.message ?? "Login successful!");
>>>>>>> origin/feature/backend-env
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
<<<<<<< HEAD
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
=======
        {/* ✅ 모바일에서는 left 섹션 자체를 렌더링하지 않음 */}
        {!isMobile && (
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
        )}
>>>>>>> origin/feature/backend-env

        <main style={styles.right}>
          <div style={styles.formWrap}>
            <h2 style={styles.title}>Welcome back</h2>
            <p style={styles.subtitle}>Sign in to your account to continue</p>

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

<<<<<<< HEAD
                <Link to="/forgot-password" style={styles.linkSmall}>
                  Forgot password?
                </Link>
=======
                {/* ✅ 삭제: Forgot password? (백엔드 지원 없어서 혼란 방지) */}
>>>>>>> origin/feature/backend-env
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
<<<<<<< HEAD
=======
}

function makeStyles({ isMobile }: { isMobile: boolean }): Record<string, React.CSSProperties> {
  return {
    page: {
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: isMobile ? 14 : 24,
      background: "#0F1115", // ✅ 배경 통일
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    },

    card: {
      width: "min(1100px, 100%)",
      minHeight: isMobile ? "auto" : "640px",
      borderRadius: isMobile ? 16 : 14,
      overflow: "hidden",
      display: "grid",
      // ✅ 모바일이면 right만 나오니 단일 컬럼
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

    brand: { margin: 0, fontSize: "34px", letterSpacing: "-0.5px", fontWeight: 800 },
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
      border: "1px solid rgba(255,255,255,0.16)",
      boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
      fontSize: "18px",
    },
    featureTitle: { fontWeight: 700, marginBottom: "6px", fontSize: "14px" },
    featureDesc: { fontSize: "12px", lineHeight: 1.45, opacity: 0.88, maxWidth: "360px" },

    right: {
      // ✅ 모바일에서 폼이 꽉 차고 보기 좋게 padding/정렬 조정
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

    title: {
      margin: 0,
      fontSize: isMobile ? "26px" : "30px",
      fontWeight: 800,
      letterSpacing: "-0.3px",
      color: "#0f172a",
    },

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

    rowBetween: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      marginTop: "4px",
      marginBottom: "18px",
      flexWrap: isMobile ? "wrap" : "nowrap",
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

    linkSmall: { fontSize: "12px", color: "#1f6bff", textDecoration: "none", fontWeight: 700 },

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
>>>>>>> origin/feature/backend-env
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
