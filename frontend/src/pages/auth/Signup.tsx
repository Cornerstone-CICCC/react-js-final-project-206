import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import zxcvbn from 'zxcvbn';
import { useUserStore } from '../../store/user.store';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, login, isLoading } = useUserStore();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

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
      canSubmit: fieldsFilled && minLenOk && matchOk && strengthOk && !isLoading,
    };
  }, [form, strength.score, isLoading]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.canSubmit) return;

    try {
      const signupResult = await signup({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });

      if (signupResult) {
        toast.success('Account created! Logging you in...');

        try {
          const loginSuccess = await login({
            email: form.email,
            password: form.password,
          });

          if (loginSuccess) {
            toast.success('Welcome to F-Insight!');
            navigate('/');
          } else {
            console.warn('⚠️ Login returned false');
            toast.error('Auto-login failed. Please log in manually.');
            navigate('/login');
          }
        } catch (loginErr) {
          console.error('❌ Auto-login threw error:', loginErr);
          toast.error('Auto-login failed.');
          navigate('/login');
        }
      } else {
        console.warn('⚠️ Signup returned FALSE (but did not throw)');
        toast.error('Registration failed (Store returned false).');
      }
    } catch (error: any) {
      console.error('❌ CATCH BLOCK TRIGGERED:', error);

      if (error?.response?.status === 409) {
        toast.error('This email is already registered.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      console.groupEnd();
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-3.5 sm:p-6 bg-[#0F1115] font-sans">
      <div className="w-[min(1100px,100%)] min-h-auto sm:min-h-160 rounded-2xl sm:rounded-[14px] overflow-hidden grid grid-cols-1 sm:grid-cols-[1.05fr_1fr] bg-white shadow-[0_18px_40px_rgba(10,20,40,0.12)]">
        {/* Left Panel */}
        <aside className="hidden sm:flex flex-col justify-center p-[48px_44px] text-white bg-linear-to-br from-[#1f6bff] via-[#1c57f2] to-[#1b4fe8]">
          <div className="w-full">
            <h1 className="m-0 text-[34px] font-extrabold">F-Insight</h1>
            <p className="mt-2.5 text-sm opacity-90">AI Financial Management Platform</p>
            <div className="w-14 h-0.5 bg-white/65 my-5.5 rounded-full" />

            <ul className="list-none p-0 m-0 grid gap-5.5">
              <li className="grid grid-cols-[44px_1fr] gap-3.5 items-start">
                <span className="w-10 h-10 rounded-xl grid place-items-center bg-white/15 text-lg">
                  📊
                </span>
                <div>
                  <div className="font-bold mb-1.5 text-sm">Real-time Analytics</div>
                  <div className="text-xs leading-relaxed opacity-90">
                    Track your finances with AI-powered insights and predictions
                  </div>
                </div>
              </li>
              <li className="grid grid-cols-[44px_1fr] gap-3.5 items-start">
                <span className="w-10 h-10 rounded-xl grid place-items-center bg-white/15 text-lg">
                  🔒
                </span>
                <div>
                  <div className="font-bold mb-1.5 text-sm">Secure &amp; Private</div>
                  <div className="text-xs leading-relaxed opacity-90">
                    Bank-level encryption keeps your financial data safe
                  </div>
                </div>
              </li>
              <li className="grid grid-cols-[44px_1fr] gap-3.5 items-start">
                <span className="w-10 h-10 rounded-xl grid place-items-center bg-white/15 text-lg">
                  ⚡
                </span>
                <div>
                  <div className="font-bold mb-1.5 text-sm">Smart Automation</div>
                  <div className="text-xs leading-relaxed opacity-90">
                    Automate bill payments and savings with intelligent algorithms
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </aside>

        {/* Right Panel - Signup Form */}
        <main className="flex items-center justify-center p-[26px_18px] sm:p-[48px_44px] bg-white">
          <div className="w-[min(420px,100%)] flex flex-col items-start">
            <h2 className="m-0 text-[26px] sm:text-[28px] font-extrabold text-gray-900">
              Create account
            </h2>
            <p className="mt-2 mb-4.5 text-[13px] text-slate-500">Sign up to get started</p>

            <form onSubmit={handleSubmit} className="w-full">
              {/* Name Fields Row */}
              <div className="flex flex-col sm:flex-row gap-3 w-full mb-3.5">
                <label className="w-full flex flex-col gap-2 text-xs text-slate-700 font-bold">
                  First name
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full h-11 rounded-[10px] border border-gray-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </label>
                <label className="w-full flex flex-col gap-2 text-xs text-slate-700 font-bold">
                  Last name
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full h-11 rounded-[10px] border border-gray-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </label>
              </div>

              {/* Email */}
              <label className="w-full flex flex-col gap-2 text-xs text-slate-700 font-bold mb-3.5">
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full h-11 rounded-[10px] border border-gray-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </label>

              {/* Password */}
              <label className="w-full flex flex-col gap-2 text-xs text-slate-700 font-bold mb-3.5">
                Password
                <div className="relative w-full flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-11 rounded-[10px] border border-gray-200 bg-slate-50 pl-3.5 pr-18 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 h-7.5 px-2.5 rounded-lg border border-gray-200 bg-white font-extrabold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {/* Strength Meter */}
              <div className="-mt-1 mb-3.5 p-3 rounded-xl border border-gray-200 bg-white">
                <div className="flex justify-between items-baseline mb-2.5">
                  <span className="text-xs font-bold text-slate-900">Password strength</span>
                  <span className="text-xs font-bold text-slate-500">
                    {getStrengthLabel(strength.score)}
                  </span>
                </div>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${((strength.score + 1) / 5) * 100}%`,
                      backgroundColor: strength.score < 3 ? '#ef4444' : '#1f6bff',
                    }}
                  />
                </div>

                <ul className="mt-2.5 pl-4 text-xs leading-relaxed list-disc marker:text-gray-300">
                  <li
                    className={
                      validation.minLenOk ? 'text-green-700 font-bold' : 'text-red-600 font-bold'
                    }
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={
                      validation.strengthOk ? 'text-green-700 font-bold' : 'text-red-600 font-bold'
                    }
                  >
                    Must be strong enough (level 3+)
                  </li>
                </ul>
              </div>

              {/* Confirm Password */}
              <label className="w-full flex flex-col gap-2 text-xs text-slate-700 font-bold mb-3.5">
                Confirm password
                <div className="relative w-full flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-11 rounded-[10px] border border-gray-200 bg-slate-50 pl-3.5 pr-18 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 h-7.5 px-2.5 rounded-lg border border-gray-200 bg-white font-extrabold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {/* Mismatch Hint */}
              {!validation.matchOk && form.confirmPassword.length > 0 && (
                <div className="-mt-2 mb-3 text-xs text-red-600 font-bold">
                  The password does not match.
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!validation.canSubmit}
                className={`w-full h-11 rounded-[10px] border-none text-white font-extrabold text-[15px] transition-all
                  ${validation.canSubmit ? 'bg-[#1f6bff] hover:bg-blue-600 cursor-pointer shadow-lg shadow-blue-500/20' : 'bg-blue-400 opacity-60 cursor-not-allowed'}`}
              >
                {isLoading ? 'Creating...' : 'Sign Up'}
              </button>

              <p className="mt-4.5 text-xs text-slate-500 text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-[#1f6bff] no-underline font-bold hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
