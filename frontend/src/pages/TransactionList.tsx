import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  LuSearch,
  LuArrowUpDown,
  LuTag,
  LuFilter,
  LuClock,
  LuCircleCheck,
  LuCircleX,
  LuUser,
  LuX,
  LuCalendar,
} from 'react-icons/lu';

import { useUIStore } from '../store/ui.store';
import { getAllExpenses, type IExpense } from '../api/expense';

// --- Types ---
interface SharedUser {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Extend IExpense locally if needed to support the flexible sharedWith structure
interface ExtendedExpense extends Omit<IExpense, 'sharedWith' | 'sharedWithEmail'> {
  sharedWith?: string | SharedUser | null;
  sharedWithEmail?: string;
}

// --- Constants ---
const CATEGORY_COLORS: { [key: string]: { bg: string; text: string } } = {
  Food: { bg: 'bg-orange-50', text: 'text-orange-600' },
  Transport: { bg: 'bg-blue-50', text: 'text-blue-600' },
  Rent: { bg: 'bg-purple-50', text: 'text-purple-600' },
  Household: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  Health: { bg: 'bg-rose-50', text: 'text-rose-600' },
  Education: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  Other: { bg: 'bg-slate-50', text: 'text-slate-600' },
};

type SortKey = 'date' | 'category' | 'sharedWithEmail' | 'amount';

// --- Components ---
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; icon: any; label: string }> = {
    Pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: LuClock, label: 'Pending' },
    Accepted: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      icon: LuCircleCheck,
      label: 'Accepted',
    },
    Personal: { bg: 'bg-slate-100', text: 'text-slate-600', icon: LuUser, label: 'Personal' },
    Rejected: { bg: 'bg-rose-100', text: 'text-rose-700', icon: LuCircleX, label: 'Rejected' },
  };

  const current = styles[status] || styles.Personal;
  const Icon = current.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight ${current.bg} ${current.text}`}
    >
      <Icon size={12} />
      <span>{current.label}</span>
    </div>
  );
}

export default function TransactionList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshKey } = useUIStore(); // Connects to your Socket logic

  const [transactions, setTransactions] = useState<ExtendedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [isAsc, setIsAsc] = useState(false);

  // --- Sync URL Search with State ---
  useEffect(() => {
    const queryFromUrl = searchParams.get('search');
    if (queryFromUrl !== null) {
      setSearchQuery(queryFromUrl);
    }
  }, [searchParams]);

  // --- Fetch Data ---
  useEffect(() => {
    const loadData = async () => {
      if (transactions.length === 0) setIsLoading(true);

      try {
        const data = await getAllExpenses();
        const list = Array.isArray(data) ? data : (data as any).expenses || [];
        setTransactions(list);
      } catch (error) {
        console.error('Failed to load expenses', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [refreshKey]);

  // --- Helpers ---
  const getRecipientDisplay = (tx: ExtendedExpense): string | null => {
    // If sharedWith is an Object (Populated)
    if (tx.sharedWith && typeof tx.sharedWith === 'object') {
      const user = tx.sharedWith as SharedUser;
      if (user.firstName) return `${user.firstName} ${user.lastName}`;
      if (user.email) return user.email;
    }

    // Fallback to sharedWithEmail string
    if (tx.sharedWithEmail) {
      const email = tx.sharedWithEmail;
      const id = email.split('@')[0];
      return id.charAt(0).toUpperCase() + id.slice(1); // Format "john.doe" -> "John.doe"
    }

    // If sharedWith is just an ID string (rare if populated, but possible)
    if (typeof tx.sharedWith === 'string') {
      return 'Unknown User';
    }

    return null; // Personal expense
  };

  const recipientList = useMemo(() => {
    const names = transactions
      .map((tx) => getRecipientDisplay(tx))
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(names));
  }, [transactions]);

  // --- Filtering Logic ---
  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((tx) => {
      const name = getRecipientDisplay(tx);

      // Recipient Filter
      const matchRecipient =
        selectedRecipient === 'All'
          ? true
          : selectedRecipient === 'Personal'
            ? !name || tx.status === 'Personal'
            : name === selectedRecipient;

      // Category Filter
      const matchCategory = selectedCategory === 'All' || tx.category === selectedCategory;

      // Search Filter
      const title = tx.title || '';
      const matchSearch = title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchRecipient && matchCategory && matchSearch;
    });

    // Sorting Logic
    return result.sort((a, b) => {
      let valA: any, valB: any;

      if (sortKey === 'sharedWithEmail') {
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

  const currentTotal = useMemo(
    () => filteredTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0),
    [filteredTransactions],
  );

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">
          Updating Ledger...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Transactions
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {filteredTransactions.length} Entries found
          </p>
        </div>

        {/* --- FILTERS TOOLBAR --- */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="group flex items-center bg-white hover:bg-slate-50 transition-colors rounded-xl shadow-sm px-3 py-2 border border-slate-100">
            <LuTag
              size={14}
              className="text-slate-400 mr-2 group-hover:text-blue-500 transition-colors"
            />
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

          {/* Recipient Dropdown */}
          <div className="group flex items-center bg-white hover:bg-slate-50 transition-colors rounded-xl shadow-sm px-3 py-2 border border-slate-100">
            <LuUser
              size={14}
              className="text-slate-400 mr-2 group-hover:text-blue-500 transition-colors"
            />
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

          {/* Sort Dropdown */}
          <div className="group flex items-center bg-white hover:bg-slate-50 transition-colors rounded-xl shadow-sm px-3 py-2 border border-slate-100">
            <LuFilter
              size={14}
              className="text-slate-400 mr-2 group-hover:text-blue-500 transition-colors"
            />
            <select
              className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="sharedWithEmail">Recipient Name</option>
            </select>
            <button
              onClick={() => setIsAsc(!isAsc)}
              className="ml-2 text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50"
            >
              <LuArrowUpDown
                size={14}
                className={`transition-transform duration-300 ${isAsc ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative grow md:max-w-xs">
            <LuSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search description..."
              className="w-full bg-white border border-slate-100 rounded-xl pl-9 pr-8 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600/10 focus:border-blue-500 outline-none shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 cursor-pointer p-1"
              >
                <LuX size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="flex-1 pb-24">
        <div className="bg-white rounded-4xlborder border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="min-w-200 w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">
                  Date
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">
                  Category
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Description
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-40">
                  Shared With
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-32">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-32">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx._id}
                    onClick={() => navigate(`/transactions/${tx._id}`)}
                    className="group cursor-pointer hover:bg-slate-50/80 transition-all duration-200"
                  >
                    {/* Date */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <LuCalendar size={12} className="opacity-50" />
                        <span className="text-xs font-bold whitespace-nowrap">
                          {tx.date
                            ? new Date(tx.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '-'}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span
                        className={`text-[9px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-wide border border-transparent ${CATEGORY_COLORS[tx.category]?.text || 'text-slate-500'} ${CATEGORY_COLORS[tx.category]?.bg || 'bg-slate-100'}`}
                      >
                        {tx.category}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-8 py-6 font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">
                      {tx.title}
                      {tx.note && (
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5 truncate max-w-50">
                          {tx.note}
                        </p>
                      )}
                    </td>

                    {/* Recipient */}
                    <td className="px-8 py-6 text-center">
                      {getRecipientDisplay(tx) ? (
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50/50 border border-blue-100">
                          <p className="text-[10px] font-bold text-blue-700">
                            {getRecipientDisplay(tx)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold text-xs">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-8 py-6 text-center">
                      <StatusBadge status={tx.status || 'Personal'} />
                    </td>

                    {/* Amount */}
                    <td className="px-8 py-6 text-right">
                      <span className="font-black text-slate-900 text-lg whitespace-nowrap tracking-tight">
                        -$
                        {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <LuSearch size={24} className="text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">No transactions found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting your filters or search terms
                        </p>
                      </div>
                      <button
                        onClick={handleClearSearch}
                        className="mt-4 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Footer Total */}
            <tfoot>
              <tr className="bg-slate-900 text-white">
                <td
                  colSpan={5}
                  className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-slate-400 text-right"
                >
                  Total Spending
                </td>
                <td className="px-8 py-6 text-right font-black text-2xl whitespace-nowrap text-white">
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
