// frontend/src/pages/profile.tsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

type CheckAuthResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const { auth, refreshAuth } = useAuth();

  const [me, setMe] = useState<ProfileView>({
    firstName: auth.user?.firstName ?? "",
    lastName: auth.user?.lastName ?? "",
    email: auth.user?.email ?? "",
  });

  const [loadingMe, setLoadingMe] = useState(true);

  const [pw, setPw] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [savingPw, setSavingPw] = useState(false);

  // ✅ Delete account
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoadingMe(true);
      try {
        const { data } = await api.get<CheckAuthResponse>("/users/check-auth");
        setMe({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
        });
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) toast.error("Session expired or not logged in!");
        else toast.error("Failed to load profile.");
      } finally {
        setLoadingMe(false);
      }
    };

    if (auth.isAuthenticated) run();
    else setLoadingMe(false);
  }, [auth.isAuthenticated]);

  const profile = useMemo(() => {
    return {
      firstName: me.firstName,
      lastName: me.lastName,
      email: me.email || auth.user?.email || "",
    };
  }, [me, auth.user?.email]);

  const onPwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPw((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = () => {
    if (!pw.currentPassword) return "Current password is required.";
    if (!pw.newPassword) return "New password is required.";
    if (pw.newPassword.length < 8) return "New password must be at least 8 characters.";
    if (pw.newPassword !== pw.confirmNewPassword) return "New passwords do not match.";
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validatePassword();
    if (err) return toast.error(err);

    if (!auth.isAuthenticated) return toast.error("You must be logged in.");

    try {
      setSavingPw(true);

      const { data } = await api.put("/users/profile", {
        currPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });

      setPw({ currentPassword: "", newPassword: "", confirmNewPassword: "" });

      toast.success(data?.message ?? "Profile updated successfully!");
      await refreshAuth();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ??
        (error?.response?.status === 401 ? "Not logged in!" : null) ??
        "Failed to update password.";
      toast.error(msg);
    } finally {
      setSavingPw(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.isAuthenticated) {
      toast.error("You must be logged in.");
      return;
    }

    const expected = (profile.email || "").trim().toLowerCase();
    const typed = deleteConfirm.trim().toLowerCase();

    if (!expected) {
      toast.error("Missing email. Reload profile and try again.");
      return;
    }
    if (typed !== expected) {
      toast.error("Please type your email exactly to confirm deletion.");
      return;
    }

    try {
      setDeleting(true);
      const { data } = await api.delete("/users/delete");

      toast.success(data?.message ?? "Account deleted successfully!");
      setDeleteConfirm("");

      await refreshAuth();
      navigate("/login", { replace: true }); // ✅ 탈퇴 후 로그인 페이지로
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ??
        (error?.response?.status === 401 ? "Not logged in!" : null) ??
        "Failed to delete account.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Toast confirm (모달 대신)
  const confirmDeleteWithToast = () => {
    if (!auth.isAuthenticated) return toast.error("You must be logged in.");

    const expected = (profile.email || "").trim().toLowerCase();
    const typed = deleteConfirm.trim().toLowerCase();

    if (!expected) return toast.error("Missing email. Reload profile and try again.");
    if (typed !== expected) return toast.error("Please type your email exactly to confirm deletion.");

    const TOAST_ID = "delete-account-confirm";
    toast.dismiss(TOAST_ID);

    toast.custom(
      (t) => (
        <div className="bg-white border border-slate-100 shadow-2xl rounded-2xl px-5 py-4 w-[360px]">
          <p className="text-sm font-black text-slate-900">Delete account?</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            This action is permanent and cannot be undone.
          </p>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-black text-xs hover:bg-slate-200 transition"
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await handleDeleteAccount();
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs hover:bg-rose-700 transition"
            >
              Yes, delete
            </button>
          </div>
        </div>
      ),
      { id: TOAST_ID, duration: 8000 },
    );
  };

  const canDelete =
    auth.isAuthenticated &&
    !loadingMe &&
    !!profile.email &&
    deleteConfirm.trim().toLowerCase() === profile.email.trim().toLowerCase() &&
    !deleting;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          View your account information and change your password.
        </p>
      </div>

      {/* ---------- Personal Info (Read only) ---------- */}
      <section className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-8">
        <h2 className="text-lg font-black text-slate-900 mb-6">Personal Info</h2>

        {!auth.isAuthenticated ? (
          <div className="text-sm text-slate-500">Not logged in.</div>
        ) : loadingMe ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
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
        )}
      </section>

      {/* ---------- Password ---------- */}
      <section className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-8">
        <h2 className="text-lg font-black text-slate-900 mb-2">Password</h2>
        <p className="text-sm text-slate-500 mb-6">Change your password.</p>

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              disabled={!auth.isAuthenticated}
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
              disabled={!auth.isAuthenticated}
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
              disabled={!auth.isAuthenticated}
            />
          </label>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={savingPw || !auth.isAuthenticated}
              className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl transition-all active:scale-95 disabled:opacity-60"
            >
              {savingPw ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </section>

      {/* ---------- Delete Account ---------- */}
      <section className="bg-white rounded-[2.5rem] border border-rose-50 shadow-sm p-8">
        <h2 className="text-lg font-black text-slate-900 mb-2">Delete Account</h2>
        <p className="text-sm text-slate-500 mb-6">
          This action is permanent. To continue, type your email and confirm.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Confirm email
            </span>
            <input
              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-semibold outline-none focus:ring-2 focus:ring-rose-200"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={profile.email ? `Type: ${profile.email}` : "Type your email"}
              disabled={!auth.isAuthenticated || loadingMe}
            />
          </label>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={confirmDeleteWithToast}
              disabled={!canDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-black shadow-xl transition-all active:scale-95 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete account"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
