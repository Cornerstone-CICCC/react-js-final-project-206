import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  LuChevronLeft,
  LuTrash2,
  LuTag,
  LuMail,
  LuLock,
  LuRotateCcw,
  LuCircleCheck,
  LuLoaderCircle,
  LuSend,
  LuStickyNote,
  LuSave,
  LuClock,
} from 'react-icons/lu';
import toast from 'react-hot-toast';

import { getExpenseById, updateExpense, deleteExpense, type IExpense } from '../api/expense';
import { BASE_URL } from '../api';
import { useUIStore } from '../store/ui.store';

import { showDeleteConfirmation } from '../utils/ConfirmDeleteToast';
import { showShareConfirmation } from '../utils/ConfirmShareToast';
import { showCancelInviteConfirmation } from '../utils/ConfirmCancelToast';

const CATEGORY_COLORS = ['Food', 'Transport', 'Rent', 'Household', 'Health', 'Education', 'Other'];

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshKey } = useUIStore();

  const [formData, setFormData] = useState<IExpense | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<{
    name: string;
    avatar: string;
    _id: string;
    email: string;
  } | null>(null);
  const [isInitialValueLocked, setIsInitialValueLocked] = useState(false);

  const getEmailFromValue = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val.email || '';
  };

  const getEmailString = () => {
    return getEmailFromValue(formData?.sharedWith);
  };

  const searchUser = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      setFoundUser(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`${BASE_URL}/users/search?email=${email.trim().toLowerCase()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const user = await res.json();
        setFoundUser({
          name: `${user.firstName} ${user.lastName}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`,
          _id: user.id || user._id,
          email: user.email,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const tx = await getExpenseById(id);
      if (tx) {
        setFormData(tx);

        const sharedVal = tx.sharedWith;
        const isPending = tx.status === 'Pending';
        const isAccepted = tx.status === 'Accepted';

        if (isPending || isAccepted) {
          setIsInitialValueLocked(true);
        } else {
          setIsInitialValueLocked(false);
        }

        const hasSharedUser =
          sharedVal &&
          ((typeof sharedVal === 'object' && ('_id' in sharedVal || 'id' in sharedVal)) ||
            (typeof sharedVal === 'string' && sharedVal.length > 0));

        if (hasSharedUser || isPending) {
          let emailToSearch = '';
          if (typeof sharedVal === 'object' && sharedVal !== null) {
            emailToSearch = (sharedVal as any).email;
          } else if (typeof sharedVal === 'string') {
            emailToSearch = sharedVal;
          } else if ((tx as any).sharedWithEmail) {
            emailToSearch = (tx as any).sharedWithEmail;
          }

          if (emailToSearch && emailToSearch.includes('@')) {
            // This ensures foundUser is populated on mount for existing shares
            searchUser(emailToSearch);
          }
        } else {
          setFoundUser(null);
        }
      } else {
        toast.error('Transaction not found');
        navigate('/transactions');
      }
    } catch (error) {
      console.error('Failed to load', error);
      navigate('/transactions');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, searchUser]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const preparePayload = (data: IExpense) => {
    const { _id, __v, createdAt, updatedAt, ...cleanData } = data as any;

    if (cleanData.status === 'Personal') {
      cleanData.sharedWith = null;
      cleanData.sharedWithEmail = null;
    } else if (foundUser) {
      cleanData.sharedWith = foundUser._id;
      cleanData.sharedWithEmail = foundUser.email;
    } else if (typeof cleanData.sharedWith === 'object') {
      cleanData.sharedWith = cleanData.sharedWith.id || cleanData.sharedWith._id;
    }

    if (typeof cleanData.paidBy === 'object' && cleanData.paidBy !== null) {
      cleanData.paidBy = cleanData.paidBy.id || cleanData.paidBy._id;
    }

    return cleanData;
  };

  const handleUpdate = (updates: Partial<IExpense>) => {
    setFormData((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const executeSave = async (dataToSave: IExpense, shouldNavigate: boolean) => {
    try {
      const cleanData = preparePayload(dataToSave);
      const success = await updateExpense(id!, cleanData);

      if (success) {
        toast.success(shouldNavigate ? 'Saved and Closed' : 'Updated');
        if (shouldNavigate) {
          navigate('/transactions');
        } else {
          await loadData();
        }
      } else {
        toast.error('Failed to update.');
      }
    } catch (error) {
      console.error('Execute save error', error);
      toast.error('Error updating transaction');
    }
  };

  const handleReset = async () => {
    if (!formData) return;
    if (formData.status === 'Pending') {
      showCancelInviteConfirmation(async (toastId) => {
        toast.remove(toastId);
        const cancelData = {
          ...formData,
          status: 'Personal',
          sharedWith: null,
          sharedWithEmail: null,
        };
        await executeSave(cancelData as unknown as IExpense, false);
        setIsInitialValueLocked(false);
        setFoundUser(null);
      });
    } else {
      handleUpdate({ sharedWith: '', status: 'Personal', sharedWithEmail: '' });
      setIsInitialValueLocked(false);
      setFoundUser(null);
    }
  };

  const handleSendRequest = () => {
    if (!foundUser || !formData) return;
    const email = getEmailString();

    showShareConfirmation(
      email,
      async (toastId) => {
        toast.remove(toastId);
        const updatedData = {
          ...formData,
          status: 'Pending' as const,
          sharedWith: foundUser._id,
          sharedWithEmail: foundUser.email,
        };
        setIsInitialValueLocked(true);
        executeSave(updatedData as IExpense, false);
      },
      (toastId) => {
        toast.remove(toastId);
      },
    );
  };

  const handleSaveClick = () => {
    if (!formData) return;
    executeSave(formData, true);
  };

  const handleDelete = async () => {
    if (!id) return;
    const success = await deleteExpense(id);
    if (success) {
      toast.success('Transaction deleted');
      navigate('/transactions');
    } else {
      toast.error('Failed to delete');
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-400 font-bold animate-pulse">Loading Details...</div>
      </div>
    );
  }

  const canReset =
    isInitialValueLocked && (formData.status === 'Pending' || formData.status === 'Personal');

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => navigate('/transactions')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm mb-8 transition-colors group cursor-pointer"
      >
        <LuChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
        to List
      </button>

      <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-50">
        <div className="p-8 md:p-12 space-y-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Edit Transaction
            </h2>
            <button
              onClick={() => showDeleteConfirmation(id!, handleDelete)}
              className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <LuTrash2 size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="bg-slate-50 p-8 rounded-4xl border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                  Amount (CAD)
                </label>
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="text-4xl font-black">$</span>
                  <input
                    type="number"
                    className="text-4xl font-black bg-transparent border-none outline-none w-full"
                    value={formData.amount}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    onChange={(e) => handleUpdate({ amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="px-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="text-lg font-bold text-slate-900 w-full border-b-2 border-slate-100 focus:border-blue-600 py-2 outline-none transition-all"
                  value={formData.title}
                  onChange={(e) => handleUpdate({ title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1">
                    <LuTag size={12} /> Category
                  </p>
                  <select
                    className="text-sm font-bold w-full outline-none bg-transparent cursor-pointer"
                    value={formData.category}
                    onChange={(e) => handleUpdate({ category: e.target.value as any })}
                  >
                    {CATEGORY_COLORS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Date</p>
                  <input
                    type="date"
                    className="text-sm font-bold w-full outline-none bg-transparent"
                    value={formData.date ? formData.date.toString().split('T')[0] : ''}
                    onChange={(e) => handleUpdate({ date: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <LuMail size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Recipient Email
                  </span>
                </div>
                {canReset && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 bg-rose-50 px-2.5 py-1.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all uppercase cursor-pointer"
                  >
                    <LuRotateCcw size={10} strokeWidth={3} />
                    {formData.status === 'Pending' ? 'Cancel Invite' : 'Reset to Edit'}
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="email"
                  placeholder="partner@gmail.com"
                  readOnly={isInitialValueLocked}
                  className={`w-full border-2 rounded-2xl px-5 py-4 text-sm font-bold transition-all outline-none pr-12 ${
                    isInitialValueLocked
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                  }`}
                  value={getEmailString()}
                  onChange={(e) => {
                    handleUpdate({ sharedWith: e.target.value });
                    if (!isInitialValueLocked) searchUser(e.target.value);
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isInitialValueLocked ? (
                    <LuLock size={16} className="text-slate-400" />
                  ) : isSearching ? (
                    <LuLoaderCircle size={16} className="text-blue-600 animate-spin" />
                  ) : foundUser ? (
                    <LuCircleCheck size={18} className="text-emerald-500" />
                  ) : null}
                </div>
              </div>

              {/* Status Badge */}
              {isInitialValueLocked && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-2xl border animate-in fade-in ${formData.status === 'Accepted' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-500 bg-amber-50 border-amber-100'}`}
                >
                  {formData.status === 'Accepted' ? (
                    <LuCircleCheck size={16} />
                  ) : (
                    <LuClock size={16} />
                  )}
                  <span className="text-xs font-bold">
                    {formData.status === 'Accepted' ? 'Connection Accepted' : 'Pending Approval...'}
                  </span>
                </div>
              )}

              {/* User Info Div */}
              {(foundUser ||
                (isInitialValueLocked &&
                  (formData.status === 'Pending' || formData.status === 'Accepted'))) &&
                foundUser && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-blue-100 shadow-sm animate-in fade-in zoom-in-95">
                    <img
                      src={foundUser.avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full bg-slate-100"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{foundUser.name}</p>
                      <p className="text-[10px] text-slate-500">{foundUser.email}</p>
                    </div>
                  </div>
                )}
            </div>

            <button
              disabled={!foundUser || isInitialValueLocked}
              onClick={handleSendRequest}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all ${
                foundUser && !isInitialValueLocked
                  ? 'bg-blue-600 text-white hover:bg-slate-900 cursor-pointer shadow-lg shadow-blue-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <LuSend size={14} strokeWidth={3} /> Send Approval Request
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <LuStickyNote size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Memo / Notes</span>
            </div>
            <textarea
              className="w-full bg-slate-50 rounded-2xl p-6 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-blue-600/5 transition-all"
              rows={4}
              value={formData.note || ''}
              onChange={(e) => handleUpdate({ note: e.target.value })}
              placeholder="Add some details..."
            />
          </div>

          <button
            onClick={handleSaveClick}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest text-sm shadow-xl cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              <LuSave size={18} /> Save and Close
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
