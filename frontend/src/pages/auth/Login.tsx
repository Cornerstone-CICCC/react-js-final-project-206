import { useState } from 'react';
import { useUserStore } from '../../store/user.store';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useUserStore();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [remember, setRemember] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email)
      setErrors((prev) => ({
        ...prev,
        email: '',
      }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password)
      setErrors((prev) => ({
        ...prev,
        password: '',
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { email: '', password: '' };
    let hasError = false;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const success = await login({ email, password });

    if (success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error('Unable to login!');
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

        {/* Right Panel - Form */}
        <main className="flex items-center justify-center p-[26px_18px] sm:p-[48px_44px] bg-white">
          <div className="w-[min(420px,100%)] flex flex-col items-start">
            <h2 className="m-0 text-[26px] sm:text-[30px] font-extrabold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2.5 mb-6 text-[13px] text-slate-500">
              Log in to your account to continue
            </p>

            <form onSubmit={handleSubmit} className="w-full" noValidate>
              {/* Email Input */}
              <div className="mb-4 w-full">
                <label className="flex flex-col gap-2 text-xs text-slate-700 font-semibold">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="example@email.com"
                    className={`w-full h-11 rounded-[10px] border px-3.5 text-sm outline-none transition-all
                      ${
                        errors.email
                          ? 'border-red-500 focus:border-red-500 bg-red-50/10'
                          : 'border-gray-200 bg-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      }`}
                  />
                </label>
                {/* Error Span */}
                {errors.email && (
                  <span className="text-[11px] text-red-500 font-semibold mt-1 ml-1 block">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password Input */}
              <div className="mb-4 w-full">
                <label className="flex flex-col gap-2 text-xs text-slate-700 font-semibold">
                  Password
                  <div className="relative w-full flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      className={`w-full h-11 rounded-[10px] border pl-3.5 pr-18 text-sm outline-none transition-all
                        ${
                          errors.password
                            ? 'border-red-500 focus:border-red-500 bg-red-50/10'
                            : 'border-gray-200 bg-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 h-7.5 px-2.5 rounded-lg border border-gray-200 bg-white font-extrabold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>
                {/* Error Span */}
                {errors.password && (
                  <span className="text-[11px] text-red-500 font-semibold mt-1 ml-1 block">
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="w-full flex items-center justify-between gap-3 mt-1 mb-4.5">
                <label className="flex items-center gap-2 text-xs text-slate-600 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500 no-underline"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-[10px] border-none bg-[#1f6bff] text-white font-extrabold cursor-pointer hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging In...' : 'Log In'}
              </button>

              <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-3 my-4.5">
                <div className="h-px bg-gray-200" />
                <span className="text-xs text-slate-400 font-bold">or</span>
                <div className="h-px bg-gray-200" />
              </div>

              <Link
                to="/signup"
                className="w-full h-11 rounded-[10px] bg-[#e8f0ff] text-[#1f6bff] font-extrabold grid place-items-center no-underline hover:bg-blue-100 transition-colors"
              >
                Sign Up
              </Link>

              <p className="mt-4 text-[11px] text-slate-400 leading-relaxed text-center w-full">
                By continuing, you agree to our{' '}
                <a href="#" className="text-[#1f6bff] no-underline font-bold hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#1f6bff] no-underline font-bold hover:underline">
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
};

export default Login;
