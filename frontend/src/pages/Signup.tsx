import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import toast from 'react-hot-toast';

import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

type SignupFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
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

// ✅ Responsive: Mobile only
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isMobile;
}

export default function Signup() {
  const navigate = useNavigate();
  const { refreshAuth, setUser } = useAuth();

  const isMobile = useIsMobile(640);
  const styles = useMemo(() => makeStyles({ isMobile }), [isMobile]);

  const [form, setForm] = useState<SignupFormState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ password show/hide
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = useMemo(() => zxcvbn(form.password), [form.password]);

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
    const strengthOk = strength.score >= 3;

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
      case 0:
        return 'Very weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Okay';
      case 3:
        return 'Strong';
      case 4:
        return 'Very strong';
      default:
        return '';
    }
  };

  const normalizeError = (err: any) => {
    const msg = err?.response?.data?.message;
    if (typeof msg === 'string' && msg.trim()) return msg;

    const status = err?.response?.status;
    if (status === 409) return 'This email is already registered.';
    if (status === 400) return 'Please check your input and try again.';
    return 'An error occurred during registration.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.canSubmit) return;

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    try {
      setIsSubmitting(true);

      // ✅ 1) Sign up
      const { data: signupData } = await api.post<SignupBackendResponse>('/users/signup', payload);
      toast.success(signupData?.message ?? 'User successfully registered!');

      // ✅ 2) Log in immediately after sign-up to create a session
      const { data: loginData } = await api.post<LoginBackendResponse>('/users/login', {
        email: payload.email,
        password: payload.password,
      });

      setUser({
        id: loginData.user.id,
        email: loginData.user.email,
        firstName: loginData.user.firstName,
        lastName: loginData.user.lastName,
      });
      await refreshAuth();

      toast.success(loginData.message ?? 'Login successful!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(normalizeError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Sign up to get started</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
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
            <div style={styles.pwWrap}>
              <input
                style={styles.pwInput}
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={styles.pwToggle}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <div style={styles.strengthWrap} aria-live="polite">
            <div style={styles.strengthHeader}>
              <span style={styles.strengthLabel}>Password strength</span>
              <span style={styles.strengthValue}>{getStrengthLabel(strength.score)}</span>
            </div>

            <div style={styles.meterTrack}>
              <div
                style={{
                  ...styles.meterFill,
                  width: `${((strength.score + 1) / 5) * 100}%`,
                  backgroundColor: strength.score < 3 ? '#ef4444' : '#1f6bff',
                }}
              />
            </div>

            <ul style={styles.rules}>
              <li style={validation.minLenOk ? styles.ruleOk : styles.ruleBad}>
                At least 8 characters
              </li>
              <li style={validation.strengthOk ? styles.ruleOk : styles.ruleBad}>
                Must be strong enough (level 3+)
              </li>
            </ul>
          </div>

          <label style={styles.label}>
            Confirm password
            <div style={styles.pwWrap}>
              <input
                style={styles.pwInput}
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                style={styles.pwToggle}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {!validation.matchOk && form.confirmPassword.length > 0 && (
            <div style={styles.hint}>The password does not match.</div>
          )}

          <button
            type="submit"
            style={{
              ...styles.primaryBtn,
              opacity: validation.canSubmit ? 1 : 0.6,
              cursor: validation.canSubmit ? 'pointer' : 'not-allowed',
            }}
            disabled={!validation.canSubmit}
          >
            {isSubmitting ? 'Creating...' : 'Sign Up'}
          </button>

          <p style={styles.bottomText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function makeStyles({ isMobile }: { isMobile: boolean }): Record<string, React.CSSProperties> {
  return {
    page: {
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: isMobile ? 14 : 24,
      background: '#0F1115',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    },

    card: {
      width: 'min(420px, 100%)',
      background: '#fff',
      borderRadius: isMobile ? 16 : 14,
      padding: isMobile ? '22px 18px 24px' : '28px 28px 32px',
      boxShadow: '0 18px 40px rgba(10, 20, 40, 0.12)',
    },

    title: {
      margin: 0,
      fontSize: isMobile ? 24 : 28,
      fontWeight: 800,
      color: '#0f172a',
    },

    subtitle: {
      margin: '8px 0 18px',
      fontSize: 13,
      color: '#64748b',
    },

    row: {
      display: 'flex',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    label: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      fontSize: 12,
      color: '#334155',
      fontWeight: 700,
      marginBottom: 14,
    },

    input: {
      width: '100%',
      height: 44,
      borderRadius: 10,
      border: '1px solid #e5e7eb',
      background: '#f8fafc',
      padding: '0 14px',
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
    },

    // ✅ password toggle UI
    pwWrap: {
      position: 'relative',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
    },

    pwInput: {
      width: '100%',
      height: 44,
      borderRadius: 10,
      border: '1px solid #e5e7eb',
      background: '#f8fafc',
      padding: '0 72px 0 14px',
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
    },

    pwToggle: {
      position: 'absolute',
      right: 10,
      height: 30,
      padding: '0 10px',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      background: '#ffffff',
      fontWeight: 900,
      fontSize: 12,
      color: '#475569',
      cursor: 'pointer',
    },

    strengthWrap: {
      marginTop: -4,
      marginBottom: 14,
      padding: 12,
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      background: '#ffffff',
    },

    strengthHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 10,
    },

    strengthLabel: { fontSize: 12, fontWeight: 800, color: '#0f172a' },
    strengthValue: { fontSize: 12, fontWeight: 800, color: '#64748b' },

    meterTrack: {
      height: 8,
      background: '#e5e7eb',
      borderRadius: 999,
      overflow: 'hidden',
    },

    meterFill: {
      height: '100%',
      borderRadius: 999,
      transition: 'width 0.3s ease, background-color 0.3s ease',
    },

    rules: {
      margin: '10px 0 0',
      paddingLeft: 16,
      fontSize: 12,
      lineHeight: 1.6,
    },

    ruleOk: { color: '#15803d', fontWeight: 700 },
    ruleBad: { color: '#b91c1c', fontWeight: 700 },

    hint: {
      marginTop: -8,
      marginBottom: 12,
      fontSize: 12,
      color: '#b91c1c',
      fontWeight: 700,
    },

    primaryBtn: {
      width: '100%',
      height: 44,
      borderRadius: 10,
      border: 'none',
      background: '#1f6bff',
      color: '#fff',
      fontWeight: 900,
      fontSize: 15,
      transition: 'all 0.2s ease',
    },

    bottomText: {
      marginTop: 18,
      fontSize: 12,
      color: '#64748b',
      textAlign: 'center',
    },

    link: { color: '#1f6bff', textDecoration: 'none', fontWeight: 900 },
  };
}
