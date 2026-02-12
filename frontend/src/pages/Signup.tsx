<<<<<<< HEAD
import React, { useMemo, useState } from "react";
=======
// frontend/src/pages/signup.tsx
import React, { useEffect, useMemo, useState } from "react";
>>>>>>> origin/feature/backend-env
import { Link, useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import toast from "react-hot-toast";

import api from "../lib/api";
<<<<<<< HEAD
import { createMockUser } from "../lib/mockAuth";
import { useAuth, TOKEN_STORAGE_KEY } from "../contexts/AuthContext";

/** ✅ 백엔드 붙이면 false로 */
const USE_MOCK = true;

// ✅ Profile 페이지에서 읽는 localStorage 키 (Profile.tsx랑 동일해야 함)
const PROFILE_STORAGE_KEY = "mock_profile_v1";
=======
import { useAuth } from "../context/AuthContext";
>>>>>>> origin/feature/backend-env

type SignupFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
<<<<<<< HEAD
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
=======
};

type SignupBackendResponse = {
  message: string;
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

// ✅ 반응형: 모바일만 판별
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

export default function Signup() {
  const navigate = useNavigate();
  const { refreshAuth, setUser } = useAuth();

  const isMobile = useIsMobile(640);
  const styles = useMemo(() => makeStyles({ isMobile }), [isMobile]);
>>>>>>> origin/feature/backend-env

  const [form, setForm] = useState<SignupFormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
<<<<<<< HEAD
    remember: false,
=======
>>>>>>> origin/feature/backend-env
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = useMemo(() => zxcvbn(form.password), [form.password]);
<<<<<<< HEAD
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
=======

  const validation = useMemo(() => {
    const fieldsFilled = !!(
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.email.trim() &&
      form.password.trim() &&
      form.confirmPassword.trim()
    );

    const minLenOk = form.password.length >= 8;
    const matchOk = form.password === form.confirmPassword;
    const strengthOk = strength.score >= 3; // ✅ 백엔드 기준(score < 3이면 거절)

    return {
      fieldsFilled,
      minLenOk,
      matchOk,
      strengthOk,
      canSubmit: fieldsFilled && minLenOk && matchOk && strengthOk && !isSubmitting,
    };
  }, [form, strength.score, isSubmitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getStrengthLabel = (score: number) => {
    switch (score) {
>>>>>>> origin/feature/backend-env
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

<<<<<<< HEAD
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
=======
  const normalizeError = (err: any) => {
    const msg = err?.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;

    const status = err?.response?.status;
    if (status === 409) return "This email is already registered.";
    if (status === 400) return "Please check your input and try again.";
    return "An error occurred during registration.";
>>>>>>> origin/feature/backend-env
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    if (!canSubmit) return;
=======
    if (!validation.canSubmit) return;

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
    };
>>>>>>> origin/feature/backend-env

    try {
      setIsSubmitting(true);

<<<<<<< HEAD
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
=======
      // ✅ 1) 회원가입
      const { data: signupData } = await api.post<SignupBackendResponse>("/users/signup", payload);
      toast.success(signupData?.message ?? "User successfully registered!");

      // ✅ 2) 가입 직후 바로 로그인해서 세션 생성
      const { data: loginData } = await api.post<LoginBackendResponse>("/users/login", {
        email: payload.email,
        password: payload.password,
      });

      // 전역 상태 반영(또는 refreshAuth로 동기화)
      setUser({
        id: loginData.user.id,
        email: loginData.user.email,
        firstName: loginData.user.firstName,
        lastName: loginData.user.lastName,
      });
      await refreshAuth();

      toast.success(loginData.message ?? "Login successful!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(normalizeError(err));
>>>>>>> origin/feature/backend-env
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
<<<<<<< HEAD
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
=======
          <div style={styles.row}>
            <label style={styles.label}>
              First name
              <input
                style={styles.input}
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
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
                autoComplete="family-name"
              />
            </label>
          </div>
>>>>>>> origin/feature/backend-env

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
<<<<<<< HEAD
              <span style={styles.strengthValue}>{strengthLabel(score)}</span>
=======
              <span style={styles.strengthValue}>{getStrengthLabel(strength.score)}</span>
>>>>>>> origin/feature/backend-env
            </div>

            <div style={styles.meterTrack}>
              <div
                style={{
                  ...styles.meterFill,
<<<<<<< HEAD
                  width: `${((score + 1) / 5) * 100}%`,
=======
                  width: `${((strength.score + 1) / 5) * 100}%`,
                  backgroundColor: strength.score < 3 ? "#ef4444" : "#1f6bff",
>>>>>>> origin/feature/backend-env
                }}
              />
            </div>

            <ul style={styles.rules}>
<<<<<<< HEAD
              <li style={passwordRules.minLenOk ? styles.ruleOk : styles.ruleBad}>
                At least 8 characters
              </li>
              <li style={score >= 2 ? styles.ruleOk : styles.ruleBad}>
                Prohibit overly simple passwords (strength level 2 or higher recommended)
=======
              <li style={validation.minLenOk ? styles.ruleOk : styles.ruleBad}>
                At least 8 characters
              </li>
              <li style={validation.strengthOk ? styles.ruleOk : styles.ruleBad}>
                Must be strong enough (level 3+)
>>>>>>> origin/feature/backend-env
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

<<<<<<< HEAD
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
=======
          {!validation.matchOk && form.confirmPassword.length > 0 && (
            <div style={styles.hint}>The password does not match.</div>
          )}

          <button
            type="submit"
            style={{
              ...styles.primaryBtn,
              opacity: validation.canSubmit ? 1 : 0.6,
              cursor: validation.canSubmit ? "pointer" : "not-allowed",
            }}
            disabled={!validation.canSubmit}
          >
>>>>>>> origin/feature/backend-env
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

<<<<<<< HEAD
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
=======
function makeStyles({ isMobile }: { isMobile: boolean }): Record<string, React.CSSProperties> {
  return {
    page: {
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: isMobile ? 14 : 24,
      background: "#0F1115", // ✅ 변경: 배경만 통일
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    },

    card: {
      width: "min(420px, 100%)",
      background: "#fff",
      borderRadius: isMobile ? 16 : 14,
      padding: isMobile ? "22px 18px 24px" : "28px 28px 32px",
      boxShadow: "0 18px 40px rgba(10, 20, 40, 0.12)",
    },

    title: {
      margin: 0,
      fontSize: isMobile ? 24 : 28,
      fontWeight: 800,
      color: "#0f172a",
    },

    subtitle: {
      margin: "8px 0 18px",
      fontSize: 13,
      color: "#64748b",
    },

    // ✅ 모바일: 이름 입력 2개를 세로로 쌓음
    row: {
      display: "flex",
      gap: 12,
      flexDirection: isMobile ? "column" : "row",
    },

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
      boxSizing: "border-box",
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
      borderRadius: 999,
      transition: "width 0.3s ease, background-color 0.3s ease",
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

    primaryBtn: {
      width: "100%",
      height: 44,
      borderRadius: 10,
      border: "none",
      background: "#1f6bff",
      color: "#fff",
      fontWeight: 900,
      fontSize: 15,
      transition: "all 0.2s ease",
    },

    bottomText: {
      marginTop: 18,
      fontSize: 12,
      color: "#64748b",
      textAlign: "center",
    },

    link: { color: "#1f6bff", textDecoration: "none", fontWeight: 900 },
  };
}
>>>>>>> origin/feature/backend-env
