import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import {
  getMockUserByEmail,
  verifyMockPassword,
  updateMockPassword,
} from "../lib/mockAuth";

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

const PROFILE_STORAGE_KEY = "mock_profile_v1";

/* ---------- mock helpers ---------- */
function readStoredProfile(): Partial<ProfileView> | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ProfileView>;
  } catch {
    return null;
  }
}
/* ---------------------------------- */

export default function Profile() {
  const { auth } = useAuth();

  // ✅ 읽기 전용 프로필 정보: mock_profile -> mock_users -> auth.user.email
  const profile = useMemo<ProfileView>(() => {
    const emailFromAuth = auth.user?.email ?? "";

    const stored = readStoredProfile();
    const fromUsers = emailFromAuth ? getMockUserByEmail(emailFromAuth) : null;

    return {
      firstName: (stored?.firstName ?? fromUsers?.firstName ?? "").toString(),
      lastName: (stored?.lastName ?? fromUsers?.lastName ?? "").toString(),
      email: (stored?.email ?? fromUsers?.email ?? emailFromAuth ?? "").toString(),
    };
  }, [auth.user?.email]);

  const [pw, setPw] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [savingPw, setSavingPw] = useState(false);

  const onPwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPw((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = () => {
    if (!pw.currentPassword) return "Current password is required.";
    if (!pw.newPassword) return "New password is required.";
    if (pw.newPassword.length < 8)
      return "New password must be at least 8 characters.";
    if (pw.newPassword !== pw.confirmNewPassword)
      return "New passwords do not match.";
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validatePassword();
    if (err) return toast.error(err);

    const email = (auth.user?.email ?? profile.email).trim();
    if (!email) return toast.error("You must be logged in.");

    try {
      setSavingPw(true);

      const check = verifyMockPassword(email, pw.currentPassword);
      if (!check.ok) {
        toast.error(
          check.reason === "USER_NOT_FOUND"
            ? "User not found. Please log in again."
            : "Current password is incorrect."
        );
        return;
      }

      const updated = updateMockPassword(email, pw.newPassword);
      if (!updated.ok) {
        toast.error("Failed to update password.");
        return;
      }

      setPw({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      toast.success("Password updated.");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          View your account information and change your password.
        </p>
      </div>

      {/* ---------- Personal Info (Read only) ---------- */}
      <section className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-8">
        <h2 className="text-lg font-black text-slate-900 mb-6">
          Personal Info
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="space-y-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              First name
            </span>
            <input
              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-100 px-4 font-semibold text-slate-500"
              value={profile.firstName}
              disabled
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Last name
            </span>
            <input
              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-100 px-4 font-semibold text-slate-500"
              value={profile.lastName}
              disabled
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Email
            </span>
            <input
              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-100 px-4 font-semibold text-slate-500"
              value={profile.email}
              disabled
            />
          </label>
        </div>
      </section>

      {/* ---------- Password ---------- */}
      <section className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-8">
        <h2 className="text-lg font-black text-slate-900 mb-2">Password</h2>
        <p className="text-sm text-slate-500 mb-6">Change your password. (Mock mode)</p>

        <form
          onSubmit={handleChangePassword}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Current password
            </span>
            <input
              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-semibold outline-none focus:ring-2 focus:ring-blue-200"
              name="currentPassword"
              type="password"
              value={pw.currentPassword}
              onChange={onPwChange}
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              New password
            </span>
            <input
              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-semibold outline-none focus:ring-2 focus:ring-blue-200"
              name="newPassword"
              type="password"
              value={pw.newPassword}
              onChange={onPwChange}
              placeholder="Min 8 characters"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Confirm new password
            </span>
            <input
              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-semibold outline-none focus:ring-2 focus:ring-blue-200"
              name="confirmNewPassword"
              type="password"
              value={pw.confirmNewPassword}
              onChange={onPwChange}
              required
            />
          </label>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={savingPw}
              className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl transition-all active:scale-95 disabled:opacity-60"
            >
              {savingPw ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
