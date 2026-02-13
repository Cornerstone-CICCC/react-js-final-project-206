import { useState, useMemo, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useLocation } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Tag,
  ChevronLeft,
  Trash2,
  Save,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  StickyNote,
  User,
  Mail,
  Lock,
  RotateCcw,
  Send,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

const CATEGORY_COLORS: { [key: string]: { bg: string; text: string } } = {
  Food: { bg: 'bg-orange-50', text: 'text-orange-600' },
  Transport: { bg: 'bg-blue-50', text: 'text-blue-600' },
  Rent: { bg: 'bg-purple-50', text: 'text-purple-600' },
  Household: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  Health: { bg: 'bg-rose-50', text: 'text-rose-600' },
  Education: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  Other: { bg: 'bg-slate-50', text: 'text-slate-600' },
};

type SortKey = 'date' | 'category' | 'shareWith' | 'amount';

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status?.toLowerCase();
  const styles: any = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock, label: 'Pending' },
    accepted: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      icon: CheckCircle2,
      label: 'Accepted',
    },
    approved: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      icon: CheckCircle2,
      label: 'Accepted',
    },
    declined: { bg: 'bg-rose-50', text: 'text-rose-600', icon: XCircle, label: 'Declined' },
    rejected: { bg: 'bg-rose-50', text: 'text-rose-600', icon: XCircle, label: 'Declined' },
  };
  const current = styles[normalizedStatus] || styles.pending;
  const Icon = current.icon;
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight',
        current.bg,
        current.text,
      )}
    >
      <Icon size={12} />
      {current.label}
    </div>
  );
}

export function TransactionPage() {
  const { transactions, deleteTransaction, updateTransaction } = useTransactions();
  const location = useLocation();
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [isAsc, setIsAsc] = useState(false);
  const [isInitialValueLocked, setIsInitialValueLocked] = useState(false);

  // 이메일이나 객체에서 이름을 안전하게 추출하는 헬퍼 함수
  const getRecipientDisplay = (tx: any) => {
    if (tx.recipientName) return tx.recipientName;

    // 수정됨: sharedWith 필드 우선 참조
    const rawShare = tx.sharedWith || tx.shareWith;
    if (!rawShare) return null;

    if (typeof rawShare === 'object') {
      return rawShare.firstName
        ? `${rawShare.firstName} ${rawShare.lastName || ''}`.trim()
        : rawShare.email?.split('@')[0];
    }

    // 문자열(이메일)인 경우
    if (typeof rawShare === 'string' && rawShare.includes('@')) {
      return rawShare.split('@')[0];
    }

    return 'Partner';
  };

  const recipientList = useMemo(() => {
    const names = transactions
      .map((tx) => getRecipientDisplay(tx))
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(names));
  }, [transactions]);

  const selectedTx = useMemo(() => {
    return transactions.find((t) => t.id === editingId || t._id === editingId);
  }, [transactions, editingId]);

  useEffect(() => {
    const targetId = location.state?.selectedId || editingId;
    if (targetId) {
      const tx = transactions.find((t) => t.id === targetId || t._id === targetId);
      // 수정됨: sharedWith 체크 로직 통일
      const shareData = tx?.sharedWith || tx?.sharedWith;
      if (shareData && shareData !== '') {
        setIsInitialValueLocked(true);
      } else {
        setIsInitialValueLocked(false);
      }
      if (location.state?.selectedId) {
        setEditingId(location.state.selectedId);
        window.history.replaceState({}, document.title);
      }
    }
  }, [editingId, location.state, transactions]);

  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((tx) => {
      const name = getRecipientDisplay(tx);
      // 수정됨: sharedWith (d 포함) 필드로 필터링 조건 통일
      const shareData = tx.sharedWith || tx.sharedWith;

      const matchRecipient =
        selectedRecipient === 'All'
          ? true
          : selectedRecipient === 'Personal'
            ? !shareData
            : name === selectedRecipient;

      const matchCategory = selectedCategory === 'All' || tx.category === selectedCategory;
      const matchSearch = tx.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchRecipient && matchCategory && matchSearch;
    });

    return result.sort((a, b) => {
      let valA: any, valB: any;
      if (sortKey === 'shareWith') {
        valA = (getRecipientDisplay(a) || 'zzz').toLowerCase();
        valB = (getRecipientDisplay(b) || 'zzz').toLowerCase();
      } else if (sortKey === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else {
        valA = (a as any)[sortKey] || 0;
        valB = (b as any)[sortKey] || 0;
      }
      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });
  }, [transactions, searchQuery, selectedCategory, selectedRecipient, sortKey, isAsc]);

  const currentTotal = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const handleSendRequest = () => {
    const shareData = selectedTx?.sharedWith || (selectedTx as any)?.shareWith;
    const targetEmail =
      typeof shareData === 'object' && shareData !== null
        ? (shareData as any).email
        : shareData || '';

    if (!targetEmail || !editingId) return;

    toast.success(`Request sent to ${targetEmail}!`, {
      icon: '🚀',
      style: {
        borderRadius: '16px',
        background: '#0f172a',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
      },
    });
    updateTransaction(editingId, { status: 'pending' });
  };

  if (!editingId) {
    return (
      <div className="relative min-h-screen flex flex-col p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Transactions
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Full spend history
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white rounded-xl shadow-sm px-3 py-2 border border-slate-50">
              <Tag size={14} className="text-slate-400 mr-2" />
              <select
                className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {Object.keys(CATEGORY_COLORS).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center bg-white rounded-xl shadow-sm px-3 py-2 border border-slate-50">
              <User size={14} className="text-slate-400 mr-2" />
              <select
                className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
              >
                <option value="All">All Recipients</option>
                <option value="Personal">Personal Only</option>
                {recipientList.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center bg-white rounded-xl shadow-sm px-3 py-2 border border-slate-50">
              <Filter size={14} className="text-slate-400 mr-2" />
              <select
                className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="shareWith">Recipient Name</option>
              </select>
              <button onClick={() => setIsAsc(!isAsc)} className="ml-2 text-blue-600">
                <ArrowUpDown
                  size={14}
                  className={cn('transition-transform', isAsc && 'rotate-180')}
                />
              </button>
            </div>
            <div className="relative flex-grow md:max-w-xs">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search description..."
                className="w-full bg-white border-none rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-600/10 outline-none shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 pb-24">
          <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden overflow-x-auto">
            <table className="min-w-[800px] w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Category
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Description
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Recipient
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx._id || tx.id}
                    onClick={() => setEditingId(tx._id || tx.id || null)}
                    className="group cursor-pointer hover:bg-blue-50/30 transition-all"
                  >
                    <td className="px-8 py-6 text-xs font-bold text-slate-400 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span
                        className={cn(
                          'text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-tighter',
                          CATEGORY_COLORS[tx.category]?.text,
                          CATEGORY_COLORS[tx.category]?.bg,
                        )}
                      >
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {(() => {
                        // 로직을 단순화하기 위해 변수 할당
                        const shareData = tx.sharedWith || (tx as any).shareWith;
                        if (!shareData) return <span className="text-slate-200 font-bold">-</span>;

                        return (
                          <div className="inline-block text-left">
                            <p className="text-xs font-bold text-slate-900">
                              {getRecipientDisplay(tx)}
                            </p>
                            <p className="text-[9px] text-slate-400 italic">
                              {typeof shareData === 'object' ? (shareData as any).email : shareData}
                            </p>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-8 py-6 text-center">
                      {tx.sharedWith || tx.sharedWith ? (
                        <StatusBadge status={tx.status || 'pending'} />
                      ) : (
                        <span className="text-slate-200">-</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 text-lg whitespace-nowrap">
                      -${tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white">
                  <td
                    colSpan={5}
                    className="px-8 py-8 text-sm font-black uppercase tracking-widest text-slate-400"
                  >
                    Total Spending
                  </td>
                  <td className="px-8 py-8 text-right font-black text-3xl">
                    -${currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => setEditingId(null)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm mb-8 transition-colors group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
        to List
      </button>
      <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-50">
        <div className="p-8 md:p-12 space-y-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Edit Transaction
            </h2>
            <button
              onClick={() => {
                if (editingId) deleteTransaction(editingId);
                setEditingId(null);
              }}
              className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                  Amount (CAD)
                </label>
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="text-4xl font-black">$</span>
                  <input
                    type="number"
                    className="text-4xl font-black bg-transparent border-none outline-none w-full"
                    value={selectedTx?.amount || 0}
                    onChange={(e) =>
                      editingId &&
                      updateTransaction(editingId, { amount: parseFloat(e.target.value) || 0 })
                    }
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
                  value={selectedTx?.title || ''}
                  onChange={(e) =>
                    editingId && updateTransaction(editingId, { title: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Category</p>
                  <select
                    className="text-sm font-bold w-full outline-none bg-transparent"
                    value={selectedTx?.category}
                    onChange={(e) =>
                      editingId && updateTransaction(editingId, { category: e.target.value })
                    }
                  >
                    {Object.keys(CATEGORY_COLORS).map((cat) => (
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
                    value={selectedTx?.date}
                    onChange={(e) =>
                      editingId && updateTransaction(editingId, { date: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Recipient Email
                  </span>
                </div>
                {isInitialValueLocked && (
                  <button
                    onClick={() => {
                      if (editingId) updateTransaction(editingId, { sharedWith: '' }); // 수정됨
                      setIsInitialValueLocked(false);
                    }}
                    className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 bg-rose-50 px-2.5 py-1.5 rounded-xl hover:bg-rose-500 transition-all uppercase"
                  >
                    <RotateCcw size={10} strokeWidth={3} /> Reset to Edit
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="email"
                  placeholder="partner@example.com"
                  readOnly={isInitialValueLocked}
                  className={cn(
                    'w-full border-2 rounded-2xl px-5 py-4 text-sm font-bold transition-all outline-none',
                    isInitialValueLocked
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed shadow-inner'
                      : 'bg-white border-white text-slate-900 focus:border-blue-600 shadow-sm',
                  )}
                  value={(() => {
                    const data = selectedTx?.sharedWith || (selectedTx as any)?.shareWith;
                    if (typeof data === 'object' && data !== null) return (data as any).email || '';
                    return data || '';
                  })()}
                  onChange={(e) =>
                    editingId && updateTransaction(editingId, { sharedWith: e.target.value })
                  }
                />
                {isInitialValueLocked && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} />
                  </div>
                )}
              </div>
            </div>
            <button
              disabled={!(selectedTx?.sharedWith || (selectedTx as any)?.shareWith)}
              onClick={handleSendRequest}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all',
                selectedTx?.sharedWith || (selectedTx as any)?.shareWith
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-slate-900'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed',
              )}
            >
              <Send size={14} strokeWidth={3} /> Send Approval Request
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <StickyNote size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Memo / Notes</span>
            </div>
            <textarea
              className="w-full bg-slate-50 rounded-2xl p-6 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-blue-600/5 transition-all"
              rows={4}
              // 읽기: note가 있으면 note를, 없으면 memo를 보여줍니다.
              value={selectedTx?.note ?? selectedTx?.memo ?? ''}
              onChange={(e) => {
                if (editingId) {
                  // 쓰기: 무조건 'note' 필드에 저장하여 데이터 형식을 점진적으로 통일합니다.
                  updateTransaction(editingId, { note: e.target.value });
                }
              }}
              placeholder="Add some details..."
            />
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              if (selectedTx?.sharedWith || (selectedTx as any)?.shareWith)
                setIsInitialValueLocked(true);
              toast.success('Transaction updated!', {
                style: {
                  borderRadius: '12px',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                },
              });
            }}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest text-sm shadow-xl shadow-slate-200"
          >
            <div className="flex items-center justify-center gap-2">
              <Save size={18} /> Save and Close
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
