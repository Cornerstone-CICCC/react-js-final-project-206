import { useState, useMemo, useEffect } from 'react';
import {
  LuPlus,
  LuTrendingUp,
  LuClock,
  LuCircleCheck,
  LuArrowRight,
  LuCircleX,
  LuUser,
  LuCalendar,
} from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { useUserStore } from '../store/user.store';
import { useUIStore } from '../store/ui.store';
import { getAllExpenses, getExpenseSummary, getMonthlyStats, type IExpense } from '../api/expense';

import DashboardStats from '../components/dashboard/DashboardStats';
import CategoryDonutChart from '../components/dashboard/CategoryDonutChart';
import SpendingBarChart from '../components/dashboard/SpendingBarChart';

// --- Types ---
interface SharedUser {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface ExtendedExpense extends Omit<IExpense, 'sharedWith' | 'sharedWithEmail' | 'paidBy'> {
  sharedWith?: string | SharedUser | null;
  sharedWithEmail?: string;
  paidBy?: string | SharedUser; // Support population
}

// --- Constants ---
const CATEGORY_COLORS: { [key: string]: { bg: string; text: string; chart: string } } = {
  Food: { bg: 'bg-orange-50', text: 'text-orange-600', chart: '#f97316' },
  Transport: { bg: 'bg-blue-50', text: 'text-blue-600', chart: '#2563eb' },
  Rent: { bg: 'bg-purple-50', text: 'text-purple-600', chart: '#a855f7' },
  Household: { bg: 'bg-emerald-50', text: 'text-emerald-600', chart: '#10b981' },
  Health: { bg: 'bg-rose-50', text: 'text-rose-600', chart: '#f43f5e' },
  Education: { bg: 'bg-indigo-50', text: 'text-indigo-600', chart: '#6366f1' },
  Other: { bg: 'bg-slate-50', text: 'text-slate-600', chart: '#64748b' },
};

const DEFAULT_COLOR = { bg: 'bg-slate-50', text: 'text-slate-600', chart: '#94a3b8' };

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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight ${current.bg} ${current.text} mx-auto`}
    >
      <Icon size={12} />
      <span>{current.label}</span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { openAddExpenseModal, refreshKey } = useUIStore();
  const { user } = useUserStore();

  const [transactions, setTransactions] = useState<ExtendedExpense[]>([]);
  const [chartData, setChartData] = useState<{ category: any[]; monthly: any[] }>({
    category: [],
    monthly: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // --- Load Data ---
  useEffect(() => {
    const loadDashboardData = async () => {
      // Only show full loading spinner on initial load (empty list)
      if (transactions.length === 0) setIsLoading(true);

      try {
        const [allExpenses, summary, monthlyStats] = await Promise.all([
          getAllExpenses(),
          getExpenseSummary(),
          getMonthlyStats(),
        ]);

        const txList = Array.isArray(allExpenses)
          ? allExpenses
          : (allExpenses as any).expenses || [];
        setTransactions(txList);

        // Process Donut Chart
        const catData = summary
          ? Object.keys(summary).map((key) => ({
              name: key,
              value: Number(summary[key]),
              color: CATEGORY_COLORS[key]?.chart || DEFAULT_COLOR.chart,
            }))
          : [];

        // Process Bar Chart
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        const fullYear = monthNames.map((month, index) => ({
          name: month,
          amount: 0,
          monthNumber: index + 1,
        }));

        if (Array.isArray(monthlyStats)) {
          monthlyStats.forEach((item: any) => {
            const monthIndex = item._id?.month - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
              fullYear[monthIndex].amount = Number(item.totalAmount || 0);
            }
          });
        }

        setChartData({ category: catData, monthly: fullYear });
      } catch (error) {
        console.error('Failed to load dashboard', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [refreshKey]);

  // --- Helper: Render Recipient ---
  const renderRecipient = (tx: ExtendedExpense) => {
    // If Personal/Rejected, no relationship to show
    if (tx.status === 'Personal' || tx.status === 'Rejected') {
      return <span className="text-slate-300 font-bold text-xs">-</span>;
    }

    const myId = user?.id || user?._id;

    // Normalize Payer ID (handle object or string)
    const payerId =
      tx.paidBy && typeof tx.paidBy === 'object'
        ? (tx.paidBy as SharedUser).id || (tx.paidBy as SharedUser)._id
        : tx.paidBy;

    const isPayer = String(myId) === String(payerId);

    if (isPayer) {
      const recipient = tx.sharedWith;
      if (!recipient) return <span className="text-slate-300 font-bold text-xs">-</span>;

      let displayText = 'Unknown';
      if (typeof recipient === 'object') displayText = recipient.email || 'User';
      else if (tx.sharedWithEmail) displayText = tx.sharedWithEmail;

      return (
        <span className="text-[10px] font-bold text-slate-500 italic bg-slate-100 px-2 py-1 rounded-md">
          Shared: {displayText}
        </span>
      );
    } else {
      const payer = tx.paidBy;
      let displayText = 'Someone';
      if (typeof payer === 'object') displayText = (payer as SharedUser).email || 'Someone';

      return (
        <span className="text-[10px] font-bold text-blue-600 italic bg-blue-50 px-2 py-1 rounded-md">
          Paid by: {displayText}
        </span>
      );
    }
  };

  // --- Computed Stats ---
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long' });
  }, []);

  const comparisonStats = useMemo(() => {
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    const lastMonth = curMonth === 0 ? 11 : curMonth - 1;
    const lastMonthYear = curMonth === 0 ? curYear - 1 : curYear;

    const thisMonthTransactions = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === curMonth && d.getFullYear() === curYear;
    });

    const lastMonthTransactions = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const thisTotal = thisMonthTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const lastTotal = lastMonthTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

    const diff = thisTotal - lastTotal;
    const percent = lastTotal === 0 ? 0 : (diff / lastTotal) * 100;

    const catStats = thisMonthTransactions.reduce((acc: any, cur) => {
      acc[cur.category] = (acc[cur.category] || 0) + Number(cur.amount);
      return acc;
    }, {});
    const topCategory =
      Object.keys(catStats).sort((a, b) => catStats[b] - catStats[a])[0] || 'None';

    return {
      thisTotal,
      lastTotal,
      diff,
      percent: parseFloat(Math.abs(percent).toFixed(1)),
      isIncreased: diff > 0,
      topCategory,
    };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4 pt-20">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">
          Updating Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 pb-24">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <LuTrendingUp className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">
              F-Insight
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Financial Overview
            </p>
          </div>
        </div>
        <button
          onClick={openAddExpenseModal}
          className="w-full md:w-auto bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <LuPlus size={18} strokeWidth={3} />
          <span className="text-xs uppercase tracking-wider">New Expense</span>
        </button>
      </div>

      {/* --- STATS CARDS --- */}
      <DashboardStats comparisonStats={comparisonStats} />

      {/* --- CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDonutChart data={chartData.category} month={currentMonthStr} />
        <SpendingBarChart data={chartData.monthly} />
      </div>

      {/* --- RECENT ACTIVITY --- */}
      <div className="space-y-4">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</h3>
          <button
            onClick={() => navigate('/transactions')}
            className="group flex items-center gap-1.5 text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:text-blue-700 transition-all cursor-pointer"
          >
            View All{' '}
            <LuArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-200 w-full text-left">
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
                    Recipient
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
                {recentTransactions.map((tx) => {
                  const catStyle = CATEGORY_COLORS[tx.category] || DEFAULT_COLOR;

                  return (
                    <tr
                      key={tx._id}
                      className="group hover:bg-slate-50/80 transition-all cursor-pointer duration-200"
                      onClick={() => navigate(`/transactions/${tx._id}`)}
                    >
                      {/* Date */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <LuCalendar size={12} className="opacity-50" />
                          <span className="text-xs font-bold whitespace-nowrap">
                            {tx.date
                              ? new Date(tx.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '-'}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-8 py-5">
                        <span
                          className={`text-[9px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-wide border border-transparent ${catStyle.text} ${catStyle.bg}`}
                        >
                          {tx.category}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-8 py-5 font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">
                        {tx.title}
                      </td>

                      {/* Recipient */}
                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-col items-center justify-center">
                          {renderRecipient(tx)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-5 text-center">
                        <StatusBadge status={tx.status || 'Personal'} />
                      </td>

                      {/* Amount */}
                      <td className="px-8 py-5 text-right">
                        <span className="font-black text-slate-900 text-lg whitespace-nowrap tracking-tight">
                          -$
                          {Number(tx.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
