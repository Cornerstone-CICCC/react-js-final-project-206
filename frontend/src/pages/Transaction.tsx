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

function StatusBadge({ status }: { status: 'pending' | 'accepted' | 'declined' }) {
  const styles = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock, label: 'Pending' },
    accepted: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      icon: CheckCircle2,
      label: 'Accepted',
    },
    declined: { bg: 'bg-rose-50', text: 'text-rose-600', icon: XCircle, label: 'Declined' },
  };
  const current = styles[status] || styles.pending;
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [isAsc, setIsAsc] = useState(false);

  // 현재 수정 중인 이메일 값이 '이미 저장된 값'인지 확인하기 위한 상태
  const [isInitialValueLocked, setIsInitialValueLocked] = useState(false);

  const getRecipientDisplay = (tx: any) => {
    if (tx.recipientName) return tx.recipientName;
    if (tx.shareWith) {
      const id = tx.shareWith.split('@')[0];
      return id.charAt(0).toUpperCase() + id.slice(1);
    }
    return null;
  };

  const recipientList = useMemo(() => {
    const names = transactions
      .map((tx) => getRecipientDisplay(tx))
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(names));
  }, [transactions]);

  // 수정 모드로 진입할 때만 잠금 여부 판단
  useEffect(() => {
    const targetId = location.state?.selectedId || editingId;
    if (targetId) {
      const tx = transactions.find((t) => t.id === targetId);
      // 이메일이 이미 존재한다면 잠금 상태로 시작
      if (tx?.shareWith && tx.shareWith !== '') {
        setIsInitialValueLocked(true);
      } else {
        setIsInitialValueLocked(false);
      }

      if (location.state?.selectedId) {
        setEditingId(location.state.selectedId);
        window.history.replaceState({}, document.title);
      }
    }
  }, [editingId, location.state]);

  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((tx) => {
      const name = getRecipientDisplay(tx);
      const matchRecipient =
        selectedRecipient === 'All'
          ? true
          : selectedRecipient === 'Personal'
            ? !name
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
        valA = a[sortKey] || 0;
        valB = b[sortKey] || 0;
      }
      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });
  }, [transactions, searchQuery, selectedCategory, selectedRecipient, sortKey, isAsc]);

  const currentTotal = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const selectedTx = transactions.find((t) => t.id === editingId);

  const handleSendRequest = () => {
    if (!selectedTx?.shareWith) return;
    toast.success(`Request sent to ${selectedTx.shareWith}!`, {
      icon: '🚀',
      style: {
        borderRadius: '16px',
        background: '#0f172a',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
      },
    });
    updateTransaction(editingId!, { status: 'pending' });
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
                    key={tx.id}
                    onClick={() => setEditingId(tx.id)}
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
                    <td className="px-8 py-6 font-bold text-slate-900 min-w-[200px]">{tx.title}</td>
                    <td className="px-8 py-6 text-center">
                      {tx.shareWith ? (
                        <div className="inline-block text-left">
                          <p className="text-xs font-bold text-slate-900 leading-none">
                            {getRecipientDisplay(tx)}
                          </p>
                          <p className="text-[9px] text-slate-400 font-medium italic mt-1">
                            {tx.shareWith}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-200 font-bold">-</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      {tx.shareWith ? (
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
                  <td className="px-8 py-8 text-right font-black text-3xl whitespace-nowrap">
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
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to List
      </button>

      <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-50">
        <div className="p-8 md:p-12 space-y-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Edit Transaction
            </h2>
            <button
              onClick={() => {
                deleteTransaction(editingId);
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
                    value={selectedTx?.amount}
                    onChange={(e) =>
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
                  value={selectedTx?.title}
                  onChange={(e) => updateTransaction(editingId, { title: e.target.value })}
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
                    onChange={(e) => updateTransaction(editingId, { category: e.target.value })}
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
                    onChange={(e) => updateTransaction(editingId, { date: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recipient Email & Request Section */}
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
                      updateTransaction(editingId!, { shareWith: '' });
                      setIsInitialValueLocked(false);
                    }}
                    className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 bg-rose-50 px-2.5 py-1.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all uppercase"
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
                  value={selectedTx?.shareWith || ''}
                  onChange={(e) => updateTransaction(editingId!, { shareWith: e.target.value })}
                />
                {isInitialValueLocked && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} />
                  </div>
                )}
              </div>
            </div>

            <button
              disabled={!selectedTx?.shareWith}
              onClick={handleSendRequest}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all',
                selectedTx?.shareWith
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
              value={selectedTx?.memo || ''}
              onChange={(e) => updateTransaction(editingId!, { memo: e.target.value })}
              placeholder="Add some details..."
            />
          </div>

          <button
            onClick={() => {
              setEditingId(null);
              // 닫을 때 현재 값을 고정함 (다음 번 열었을 때 잠김)
              if (selectedTx?.shareWith) setIsInitialValueLocked(true);
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
