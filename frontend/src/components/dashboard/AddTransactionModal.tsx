import { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Tag,
  Mail,
  StickyNote,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { socket } from '../../lib/socket';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../context/TransactionContext';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Household', 'Health', 'Education', 'Other'];

export default function AddTransactionModal({
  isOpen,
  onClose,
  initialDate,
}: AddTransactionModalProps) {
  const { auth } = useAuth();
  const { fetchTransactions } = useTransactions();

  const [formData, setFormData] = useState({
    date: initialDate || new Date().toISOString().split('T')[0],
    title: '',
    amount: '',
    category: 'Food',
    shareWith: '',
    memo: '',
  });

  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [foundUser, setFoundUser] = useState<{ name: string; avatar: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!formData.shareWith) {
      setEmailStatus('idle');
      setFoundUser(null);
      return;
    }

    if (formData.shareWith === auth.user?.email) {
      setEmailStatus('invalid');
      setFoundUser(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (!formData.shareWith.includes('@')) {
        setEmailStatus('invalid');
        return;
      }

      setEmailStatus('loading');

      try {
        const response = await api.get(`/users/search?email=${formData.shareWith}`);
        if (response.data) {
          setEmailStatus('valid');
          setFoundUser({
            name: `${response.data.firstName} ${response.data.lastName}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.firstName}`,
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
  }, [formData.shareWith, auth.user?.email]);

  useEffect(() => {
    if (isOpen) {
      const handleSuccess = () => {
        console.log('Expense saved successfully!'); // 로그로 확인
        setIsSubmitting(false);
        resetForm();
        onClose();
        // 매우 중요: 여기서 fetchTransactions가 최신 데이터를 다시 가져와야 Dashboard가 업데이트됩니다.
        fetchTransactions();
        toast.success('Expense saved!');
      };

      const handleError = (error: any) => {
        setIsSubmitting(false);
        toast.error(error.message || 'Failed to save');
      };

      socket.on('expense_saved', handleSuccess);
      socket.on('expense_error', handleError);

      return () => {
        socket.off('expense_saved', handleSuccess);
        socket.off('expense_error', handleError);
      };
    }
  }, [isOpen, fetchTransactions]);

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: 'Food',
      shareWith: '',
      memo: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEmailStatus('idle');
    setFoundUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user?.id || emailStatus === 'loading' || isSubmitting) return;

    setIsSubmitting(true);

    const expenseData = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      sharedWith: formData.shareWith || null,
      note: formData.memo, // note로 필드명 통일 확인
      paidBy: auth.user.id,
    };

    // 백엔드가 소켓을 통해 저장 완료를 알려주지 않는 경우를 대비해
    // 타임아웃을 걸거나, 직접 fetchTransactions를 호출하는 로직이 필요할 수 있습니다.
    socket.emit('sendExpense', expenseData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Expense</h2>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">
              Vancouver Spending
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-1">
                  Amount (CAD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <DollarSign size={14} />
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

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                <Tag size={10} /> Category
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

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                Recipient Email (Request Approval)
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="partner@example.com"
                  className={cn(
                    'w-full border-2 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all',
                    emailStatus === 'valid'
                      ? 'border-emerald-500 bg-white'
                      : emailStatus === 'invalid'
                        ? 'border-rose-300 bg-rose-50/30'
                        : 'border-transparent bg-slate-50 focus:border-blue-600/20',
                  )}
                  value={formData.shareWith}
                  onChange={(e) => setFormData({ ...formData, shareWith: e.target.value })}
                />

                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {emailStatus === 'loading' && (
                    <Loader2 size={16} className="text-blue-600 animate-spin" />
                  )}
                  {emailStatus === 'valid' && foundUser && (
                    <div className="flex items-center gap-2 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 animate-in zoom-in duration-300">
                      <img src={foundUser.avatar} className="w-5 h-5 rounded-full" alt="user" />
                      <span className="text-[9px] font-black text-emerald-600 uppercase">
                        {foundUser.name}
                      </span>
                      <CheckCircle2 size={12} className="text-emerald-600" />
                    </div>
                  )}
                  {emailStatus === 'invalid' && formData.shareWith && (
                    <div className="flex items-center gap-1 text-rose-500 animate-in shake-1">
                      <span className="text-[9px] font-black uppercase">
                        {formData.shareWith === auth.user?.email ? 'Your Email' : 'Not Found'}
                      </span>
                      <XCircle size={14} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                <StickyNote size={10} /> Detailed Memo
              </label>
              <textarea
                placeholder="Notes about this expense..."
                rows={2}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none resize-none font-medium"
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={
                emailStatus === 'loading' ||
                isSubmitting ||
                (formData.shareWith !== '' && emailStatus === 'invalid')
              }
              className={cn(
                'w-full font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 mt-4 hover:-translate-y-0.5 active:scale-95',
                emailStatus === 'loading' ||
                  isSubmitting ||
                  (formData.shareWith !== '' && emailStatus === 'invalid')
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-slate-900 text-white shadow-blue-600/20',
              )}
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Send size={18} /> Save Expense
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
