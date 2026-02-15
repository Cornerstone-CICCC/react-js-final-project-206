import { useState, useEffect } from 'react';
import {
  LuX,
  LuDollarSign,
  LuTag,
  LuMail,
  LuStickyNote,
  LuSend,
  LuCircleCheck,
  LuCircleX,
  LuLoaderCircle,
} from 'react-icons/lu';
import toast from 'react-hot-toast';

import { createExpense } from '../../api/expense';
import { BASE_URL } from '../../api';
import { useUIStore } from '../../store/ui.store';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Household', 'Health', 'Education', 'Other'];

export default function AddExpenseModal({
  isOpen,
  onClose,
  initialDate,
}: AddTransactionModalProps) {
  // Get the refresh trigger
  const { triggerRefresh } = useUIStore();

  const [formData, setFormData] = useState({
    date: initialDate || new Date().toISOString().split('T')[0],
    title: '',
    amount: '',
    category: 'Food',
    shareWith: '',
    note: '',
  });

  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [foundUser, setFoundUser] = useState<{ name: string; avatar: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- User Search Effect ---
  useEffect(() => {
    if (!formData.shareWith || !formData.shareWith.includes('@')) {
      setEmailStatus('idle');
      setFoundUser(null);
      return;
    }

    const timer = setTimeout(async () => {
      setEmailStatus('loading');
      try {
        const res = await fetch(
          `${BASE_URL}/users/search?email=${formData.shareWith.trim().toLowerCase()}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (res.ok) {
          const user = await res.json();
          setEmailStatus('valid');
          setFoundUser({
            name: `${user.firstName} ${user.lastName}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`,
          });
        } else {
          setEmailStatus('invalid');
          setFoundUser(null);
        }
      } catch (error) {
        setEmailStatus('invalid');
        setFoundUser(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.shareWith]);

  // --- Reset Form on Open ---
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        date: initialDate || new Date().toISOString().split('T')[0],
      }));
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newExpense = await createExpense({
        title: formData.title,
        amount: parseFloat(formData.amount) || 0,
        category: formData.category,
        date: formData.date,
        sharedWith: formData.shareWith.trim().toLowerCase() || undefined,
        note: formData.note,
      });

      if (newExpense) {
        toast.success('Expense added successfully!');

        // Reset Form
        setFormData({
          title: '',
          amount: '',
          category: 'Food',
          shareWith: '',
          note: '',
          date: new Date().toISOString().split('T')[0],
        });
        setEmailStatus('idle');

        triggerRefresh();
        onClose();
      } else {
        toast.error('Failed to save expense');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
          >
            <LuX size={20} />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Expense</h2>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">
              Add Transaction
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                Title
              </label>
              <input
                required
                type="text"
                placeholder="What did you pay for?"
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Amount & Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-1">
                  Amount (CAD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <LuDollarSign size={14} />
                  </span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-5 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none font-bold"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none font-bold"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                <LuTag size={10} /> Category
              </label>
              <select
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none appearance-none cursor-pointer font-bold"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                Recipient Email (Request Approval)
              </label>
              <div className="relative">
                <LuMail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="partner@example.com"
                  className={`
                    w-full border-2 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all
                    ${
                      emailStatus === 'valid'
                        ? 'border-emerald-500 bg-white'
                        : emailStatus === 'invalid'
                          ? 'border-rose-300 bg-rose-50/30'
                          : 'border-transparent bg-slate-50 focus:border-blue-600/20'
                    }
                  `}
                  value={formData.shareWith}
                  onChange={(e) => setFormData({ ...formData, shareWith: e.target.value })}
                />

                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {emailStatus === 'loading' && (
                    <LuLoaderCircle size={16} className="text-blue-600 animate-spin" />
                  )}
                  {emailStatus === 'valid' && foundUser && (
                    <div className="flex items-center gap-2 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 animate-in zoom-in duration-300">
                      <img src={foundUser.avatar} className="w-5 h-5 rounded-full" alt="user" />
                      <span className="text-[9px] font-black text-emerald-600 uppercase">
                        {foundUser.name}
                      </span>
                      <LuCircleCheck size={12} className="text-emerald-600" />
                    </div>
                  )}
                  {emailStatus === 'invalid' && formData.shareWith && (
                    <div className="flex items-center gap-1 text-rose-500 animate-in shake-1">
                      <span className="text-[9px] font-black uppercase">Not Found</span>
                      <LuCircleX size={14} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Memo Textarea */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                <LuStickyNote size={10} /> Detailed Memo
              </label>
              <textarea
                placeholder="Notes about this expense..."
                rows={2}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none resize-none font-medium"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || emailStatus === 'loading'}
              className={`
                w-full font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 mt-4 hover:-translate-y-0.5 active:scale-95 cursor-pointer
                ${
                  isSubmitting || emailStatus === 'loading'
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-slate-900 text-white shadow-blue-600/20'
                }
              `}
            >
              {isSubmitting ? (
                'Saving...'
              ) : emailStatus === 'loading' ? (
                'Verifying...'
              ) : (
                <>
                  <LuSend size={18} /> Save Expense
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
