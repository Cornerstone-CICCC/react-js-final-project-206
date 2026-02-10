import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import toast from "react-hot-toast";

import api from "../lib/api";
import { createMockUser } from "../lib/mockAuth";
import { useAuth, TOKEN_STORAGE_KEY } from "../contexts/AuthContext";

/** ✅ 백엔드 붙이면 false로 */
const USE_MOCK = true;

// ✅ Profile 페이지에서 읽는 localStorage 키 (Profile.tsx랑 동일해야 함)
const PROFILE_STORAGE_KEY = "mock_profile_v1";

type SignupFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  remember: boolean;
};

type SignupResponse = {
  token?: string;
  user?: {
    id: string;
    email: string;
    partnerId?: string | null;
  };
  message?: string;
};

export default function Signup() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [form, setForm] = useState<SignupFormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    remember: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = useMemo(() => zxcvbn(form.password), [form.password]);
  const score = strength.score;

  const passwordRules = useMemo(() => {
    const minLenOk = form.password.length >= 8;
    const matchOk = form.password === form.confirmPassword && form.confirmPassword.length > 0;
    return { minLenOk, matchOk };
  }, [form.password, form.confirmPassword]);

  const canSubmit = useMemo(() => {
    const firstNameOk = form.firstName.trim().length > 0;
    const lastNameOk = form.lastName.trim().length > 0;
    const emailOk = form.email.trim().length > 0;
    const pwOk = passwordRules.minLenOk && score >= 2;
    const matchOk = passwordRules.matchOk;

    return firstNameOk && lastNameOk && emailOk && pwOk && matchOk && !isSubmitting;
  }, [form.firstName, form.lastName, form.email, passwordRules, score, isSubmitting]);

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

  // ✅ Profile 페이지 자동 채움용 저장
  const saveProfileForProfilePage = () => {
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
      })
    );
  };

  const strengthLabel = (s: number) => {
    switch (s) {
      case 0:
        return "Very weak";
      case 1:
        return "Weak";
      case 2:
        return "Okay";
      case 3:
        return "Strong";
      case 4:
        return "Very strong";
      default:
        return "";
    }
  };

  const normalizeError = (err: unknown) => {
    if (typeof err === "object" && err !== null) {
      // @ts-expect-error
      const msg = err?.response?.data?.message;
      if (typeof msg === "string") return msg;
      // @ts-expect-error
      const status = err?.response?.status;
      if (status === 409) return "This email address is already registered.";
    }
    return "An error has occurred during registration.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));

        // ✅ 이미 있는 이메일이면 createMockUser 내부에서 throw
        const created = createMockUser({
          email: payload.email,
          password: payload.password,
          firstName: payload.firstName,
          lastName: payload.lastName,
        });

        const fakeToken = "mock_token_" + Math.random().toString(36).slice(2);

        const fakeUser = {
          id: created.id,
          email: created.email,
          partnerId: created.partnerId ?? null,
        };

        // ✅ Profile 페이지에서 보일 정보 저장
        saveProfileForProfilePage();

        saveToken(fakeToken, form.remember);
        setAuth({ token: fakeToken, user: fakeUser });

        toast.success("Account created!");
        navigate("/dashboard", { replace: true });
        return;
      }

      const { data } = await api.post<SignupResponse>("/auth/signup", payload);

      if (data.token && data.user) {
        // ✅ Profile 페이지에서 보일 정보 저장
        saveProfileForProfilePage();

        saveToken(data.token, form.remember);
        setAuth({ token: data.token, user: data.user });

        // 너가 정한 룰: invite 없음 → 무조건 dashboard
        toast.success("Account created!");
        navigate("/dashboard", { replace: true });
        return;
      }

      toast.success("Account created! Please log in.");
      navigate("/login", { replace: true });
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
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Sign up to get started</p>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          {/* ✅ 이름 필드 */}
          <label style={styles.label}>
            First name
            <input
              style={styles.input}
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </label>

          <label style={styles.label}>
            Last name
            <input
              style={styles.input}
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </label>

          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
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
              autoComplete="new-password"
              required
            />
          </label>

          <div style={styles.strengthWrap} aria-live="polite">
            <div style={styles.strengthHeader}>
              <span style={styles.strengthLabel}>Password strength</span>
              <span style={styles.strengthValue}>{strengthLabel(score)}</span>
            </div>

            <div style={styles.meterTrack}>
              <div
                style={{
                  ...styles.meterFill,
                  width: `${((score + 1) / 5) * 100}%`,
                }}
              />
            </div>

            <ul style={styles.rules}>
              <li style={passwordRules.minLenOk ? styles.ruleOk : styles.ruleBad}>
                At least 8 characters
              </li>
              <li style={score >= 2 ? styles.ruleOk : styles.ruleBad}>
                Prohibit overly simple passwords (strength level 2 or higher recommended)
              </li>
            </ul>
          </div>

          <label style={styles.label}>
            Confirm password
            <input
              style={styles.input}
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </label>

          {!passwordRules.matchOk && form.confirmPassword.length > 0 && (
            <div style={styles.hint}>The password does not match.</div>
          )}

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

          <button type="submit" style={styles.primaryBtn} disabled={!canSubmit}>
            {isSubmitting ? "Creating..." : "Sign Up"}
          </button>

          <p style={styles.bottomText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "#f5f7fb",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
  },
  card: {
    width: "min(420px, 100%)",
    background: "#fff",
    borderRadius: 14,
    padding: 28,
    boxShadow: "0 18px 40px rgba(10, 20, 40, 0.12)",
  },
  title: { margin: 0, fontSize: 28, fontWeight: 800, color: "#0f172a" },
  subtitle: { margin: "8px 0 18px", fontSize: 13, color: "#64748b" },
  label: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 12,
    color: "#334155",
    fontWeight: 700,
    marginBottom: 14,
  },
  input: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    padding: "0 14px",
    fontSize: 14,
    outline: "none",
  },
  strengthWrap: {
    marginTop: -4,
    marginBottom: 14,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
  },
  strengthHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  strengthLabel: { fontSize: 12, fontWeight: 800, color: "#0f172a" },
  strengthValue: { fontSize: 12, fontWeight: 800, color: "#64748b" },
  meterTrack: {
    height: 8,
    background: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    background: "#1f6bff",
    borderRadius: 999,
  },
  rules: {
    margin: "10px 0 0",
    paddingLeft: 16,
    fontSize: 12,
    lineHeight: 1.6,
  },
  ruleOk: { color: "#15803d", fontWeight: 700 },
  ruleBad: { color: "#b91c1c", fontWeight: 700 },
  hint: {
    marginTop: -8,
    marginBottom: 12,
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: 700,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#475569",
    fontWeight: 700,
    marginBottom: 16,
  },
  checkbox: { width: 14, height: 14 },
  primaryBtn: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    border: "none",
    background: "#1f6bff",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  bottomText: {
    marginTop: 14,
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  link: { color: "#1f6bff", textDecoration: "none", fontWeight: 900 },
};
