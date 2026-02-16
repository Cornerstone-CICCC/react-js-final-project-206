import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useUserStore } from '../store/user.store';
import { useNavigate } from 'react-router';
import {
  LuUser,
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuSave,
  LuTrash2,
  LuShieldAlert,
  LuFingerprint,
  LuLoaderCircle,
} from 'react-icons/lu';

import { BASE_URL } from '../api';

type ProfileView = {
  firstName: string;
  lastName: string;
  email: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function Profile() {
  const navigate = useNavigate();

  const { user, isAuthenticated, checkAuth } = useUserStore();

  const [me, setMe] = useState<ProfileView>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });

  const [loadingMe, setLoadingMe] = useState(true);

  const [pw, setPw] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [savingPw, setSavingPw] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);

  // Toggle Visibility
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  // --- Fetch Profile Data ---
  useEffect(() => {
    const run = async () => {
      setLoadingMe(true);
      try {
        const res = await fetch(`${BASE_URL}/users/check-auth`, {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setMe({
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            email: data.email ?? '',
          });
        } else if (res.status === 401) {
          toast.error('Session expired or not logged in!');
        } else {
          toast.error('Failed to load profile.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile.');
      } finally {
        setLoadingMe(false);
      }
    };

    if (isAuthenticated) run();
    else setLoadingMe(false);
  }, [isAuthenticated]);

  const profile = useMemo(() => {
    return {
      firstName: me.firstName,
      lastName: me.lastName,
      email: me.email || user?.email || '',
    };
  }, [me, user?.email]);

  const onInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMe((prev) => ({ ...prev, [name]: value }));
  };

  const validateInfo = () => {
    if (!me.firstName.trim()) return 'First name is required.';
    if (!me.lastName.trim()) return 'Last name is required.';
    if (!me.email.trim()) return 'Email is required.';
    const emailOk = /^\S+@\S+\.\S+$/.test(me.email.trim());
    if (!emailOk) return 'Please enter a valid email address.';
    return null;
  };

  // --- Update Info ---
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('You must be logged in.');
    const err = validateInfo();
    if (err) return toast.error(err);

    try {
      setSavingInfo(true);

      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: me.firstName.trim(),
          lastName: me.lastName.trim(),
          email: me.email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update');
      }

      toast.success(data?.message ?? 'Profile updated successfully!');

      await checkAuth();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setSavingInfo(false);
    }
  };

  const onPwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPw((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = () => {
    if (!pw.currentPassword) return 'Current password is required.';
    if (!pw.newPassword) return 'New password is required.';
    if (pw.newPassword.length < 8) return 'New password must be at least 8 characters.';
    if (pw.newPassword !== pw.confirmNewPassword) return 'New passwords do not match.';
    return null;
  };

  // --- Update Password ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePassword();
    if (err) return toast.error(err);
    if (!isAuthenticated) return toast.error('You must be logged in.');

    try {
      setSavingPw(true);

      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currPassword: pw.currentPassword,
          newPassword: pw.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      setPw({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      toast.success(data?.message ?? 'Password updated successfully!');

      await checkAuth();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password.');
    } finally {
      setSavingPw(false);
    }
  };

  // --- Delete Account ---
  const handleDeleteAccount = async () => {
    if (!isAuthenticated) return toast.error('You must be logged in.');
    const expected = (profile.email || '').trim().toLowerCase();
    const typed = deleteConfirm.trim().toLowerCase();

    if (!expected) return toast.error('Missing email. Reload profile and try again.');
    if (typed !== expected)
      return toast.error('Please type your email exactly to confirm deletion.');

    try {
      setDeleting(true);

      const res = await fetch(`${BASE_URL}/users/delete`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }

      toast.success(data?.message ?? 'Account deleted successfully!');
      setDeleteConfirm('');

      await checkAuth();
      navigate('/login', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteWithToast = () => {
    if (!isAuthenticated) return toast.error('You must be logged in.');
    const expected = (profile.email || '').trim().toLowerCase();
    const typed = deleteConfirm.trim().toLowerCase();

    if (!expected) return toast.error('Missing email. Reload profile and try again.');
    if (typed !== expected) return toast.error('Please type your email exactly to confirm.');

    const TOAST_ID = 'delete-account-confirm';
    toast.remove(TOAST_ID);

    toast.custom(
      (t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white shadow-2xl rounded-2xl ring-1 ring-black ring-opacity-5 p-4 border border-rose-100`}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center">
                <LuShieldAlert className="h-5 w-5 text-rose-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Delete Account?</p>
              <p className="mt-1 text-xs text-slate-500">
                This action is permanent and cannot be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={async () => {
                    toast.remove(t.id);
                    await handleDeleteAccount();
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => toast.remove(t.id)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      { id: TOAST_ID, duration: 8000 },
    );
  };

  const canSaveInfo = isAuthenticated && !loadingMe && !savingInfo;
  const canDelete =
    isAuthenticated &&
    !loadingMe &&
    !!profile.email &&
    deleteConfirm.trim().toLowerCase() === profile.email.trim().toLowerCase() &&
    !deleting;

  if (loadingMe) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-400 font-bold animate-pulse">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">
          Profile Settings
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          Manage your account information
        </p>
      </div>

      {/* ---------- Personal Info ---------- */}
      <section className="bg-white rounded-[3rem] border border-slate-50 shadow-sm p-8 md:p-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <LuFingerprint size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Personal Info</h2>
            <p className="text-xs font-bold text-slate-400">Update your public details</p>
          </div>
        </div>

        <form onSubmit={handleSaveInfo} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                First Name
              </label>
              <div className="relative">
                <LuUser
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-300"
                  name="firstName"
                  value={me.firstName}
                  onChange={onInfoChange}
                  disabled={!isAuthenticated}
                  placeholder="First Name"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Last Name
              </label>
              <div className="relative">
                <LuUser
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-300"
                  name="lastName"
                  value={me.lastName}
                  onChange={onInfoChange}
                  disabled={!isAuthenticated}
                  placeholder="Last Name"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Email Address
            </label>
            <div className="relative">
              <LuMail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-300"
                name="email"
                type="email"
                value={me.email}
                onChange={onInfoChange}
                disabled={!isAuthenticated}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!canSaveInfo}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest text-xs shadow-lg shadow-slate-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingInfo ? (
                <LuLoaderCircle className="animate-spin" size={16} />
              ) : (
                <LuSave size={16} />
              )}
              {savingInfo ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* ---------- Security ---------- */}
      <section className="bg-white rounded-[3rem] border border-slate-50 shadow-sm p-8 md:p-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <LuLock size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Security</h2>
            <p className="text-xs font-bold text-slate-400">Update your password</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 transition-all placeholder:text-slate-300 pr-12"
                name="currentPassword"
                type={showCurrentPw ? 'text' : 'password'}
                value={pw.currentPassword}
                onChange={onPwChange}
                required
                disabled={!isAuthenticated}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showCurrentPw ? <LuEyeOff size={18} /> : <LuEye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 transition-all placeholder:text-slate-300 pr-12"
                  name="newPassword"
                  type={showNewPw ? 'text' : 'password'}
                  value={pw.newPassword}
                  onChange={onPwChange}
                  placeholder="Min 8 characters"
                  required
                  disabled={!isAuthenticated}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showNewPw ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Confirm New
              </label>
              <div className="relative">
                <input
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 transition-all placeholder:text-slate-300 pr-12"
                  name="confirmNewPassword"
                  type={showConfirmPw ? 'text' : 'password'}
                  value={pw.confirmNewPassword}
                  onChange={onPwChange}
                  placeholder="Repeat new password"
                  required
                  disabled={!isAuthenticated}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showConfirmPw ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={savingPw || !isAuthenticated}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-amber-600 transition-all uppercase tracking-widest text-xs shadow-lg shadow-slate-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingPw ? (
                <LuLoaderCircle className="animate-spin" size={16} />
              ) : (
                <LuLock size={16} />
              )}
              {savingPw ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>

      {/* ---------- Danger Zone ---------- */}
      <section className="bg-white rounded-[3rem] border border-rose-100 shadow-sm p-8 md:p-12 overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <LuShieldAlert size={200} className="text-rose-500" />
        </div>

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
            <LuTrash2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-rose-600 tracking-tight">Danger Zone</h2>
            <p className="text-xs font-bold text-rose-300">Irreversible actions</p>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <div>
            <label className="text-[10px] font-black text-rose-300 uppercase tracking-widest block mb-2">
              Confirm Account Deletion
            </label>
            <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
              <p className="text-sm font-bold text-rose-700 mb-4">
                This action is permanent. To confirm, please type your email address below:
                <br />
                <span className="text-slate-900 select-all">{profile.email}</span>
              </p>
              <input
                className="w-full bg-white border-2 border-rose-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-rose-500 transition-all placeholder:text-rose-200"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type your email to confirm"
                disabled={!isAuthenticated || loadingMe}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={confirmDeleteWithToast}
            disabled={!canDelete}
            className="w-full bg-white border-2 border-rose-100 text-rose-500 font-black py-4 rounded-2xl hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all uppercase tracking-widest text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <LuLoaderCircle className="animate-spin" size={16} />
            ) : (
              <LuTrash2 size={16} />
            )}
            {deleting ? 'Deleting Account...' : 'Delete Account Permanently'}
          </button>
        </div>
      </section>
    </div>
  );
}
