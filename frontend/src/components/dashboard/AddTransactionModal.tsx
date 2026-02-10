import { useState, useEffect } from 'react';
import { X, DollarSign, Tag, Mail, StickyNote, Send } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';

// 인터페이스 정의 (Props 대신 이 이름을 사용하여 에러 해결)
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
  const { addTransaction } = useTransactions();

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    date: initialDate || new Date().toISOString().split('T')[0],
    title: '',
    amount: '',
    category: 'Food',
    shareWith: '',
    memo: '',
  });

  // 모달이 열릴 때나 전달받은 initialDate가 변경될 때 날짜 업데이트
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        date: initialDate || new Date().toISOString().split('T')[0],
      }));
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addTransaction({
      title: formData.title,
      amount: parseFloat(formData.amount) || 0,
      category: formData.category,
      date: formData.date,
      shareWith: formData.shareWith,
      memo: formData.memo,
    });

    // 폼 상태 초기화
    setFormData({
      title: '',
      amount: '',
      category: 'Food',
      shareWith: '',
      memo: '',
      date: new Date().toISOString().split('T')[0],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* 배경 오버레이 (블러 처리) */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>

          {/* 헤더 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Expense</h2>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">
              Vancouver Spending
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title 필드 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                Title
              </label>
              <input
                required
                type="text"
                placeholder="What did you pay for?"
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Amount & Date (2개 열 구성) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-blue-600">
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
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none font-medium"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            {/* Category 선택 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                <Tag size={10} /> Category
              </label>
              <select
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none appearance-none cursor-pointer font-medium"
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

            {/* 공유 이메일 (Share with) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Recipient Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  type="email" // 3. 이메일 타입 적용
                  placeholder="partner@example.com"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                  value={formData.shareWith}
                  onChange={(e) => setFormData({ ...formData, shareWith: e.target.value })}
                />
              </div>
            </div>

            {/* 상세 메모 (Memo) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                <StickyNote size={10} /> Detailed Memo
              </label>
              <textarea
                placeholder="Notes about this expense..."
                rows={3}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none resize-none"
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              />
            </div>

            {/* 저장 버튼 */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4 hover:-translate-y-0.5 active:scale-95"
            >
              <Send size={18} />
              Save Expense
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
