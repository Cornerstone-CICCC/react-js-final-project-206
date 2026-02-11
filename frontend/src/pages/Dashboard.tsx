import { useState, useMemo } from 'react';
import {
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Award,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useTransactions } from '../context/TransactionContext';
import AddTransactionModal from '../components/dashboard/AddTransactionModal';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

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
  const { bg, text, icon: Icon, label } = styles[status];
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${bg} ${text} w-fit mx-auto`}>
      <Icon size={12} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // [핵심 추가] 지난달과 이번 달 상세 비교 로직
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

    const thisTotal = thisMonthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const lastTotal = lastMonthTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    const diff = thisTotal - lastTotal;
    const percent = lastTotal === 0 ? 0 : (diff / lastTotal) * 100;

    // 이번 달 가장 많이 쓴 카테고리 추출
    const catStats = thisMonthTransactions.reduce((acc: any, cur) => {
      acc[cur.category] = (acc[cur.category] || 0) + cur.amount;
      return acc;
    }, {});

    const topCategory =
      Object.keys(catStats).sort((a, b) => catStats[b] - catStats[a])[0] || 'None';

    return {
      thisTotal,
      lastTotal,
      diff,
      percent: Math.abs(percent).toFixed(1),
      isIncreased: diff > 0,
      topCategory,
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const currentMonthTransactions = transactions.filter((tx) =>
      tx.date.startsWith(currentMonthStr),
    );
    const stats = currentMonthTransactions.reduce((acc: any, cur) => {
      acc[cur.category] = (acc[cur.category] || 0) + cur.amount;
      return acc;
    }, {});

    return Object.keys(stats).map((key) => ({
      name: key,
      value: stats[key],
      color: CATEGORY_COLORS[key]?.chart || DEFAULT_COLOR.chart,
    }));
  }, [transactions, currentMonthStr]);

  const monthlyData = useMemo(() => {
    const months = [
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
    return months.map((month, index) => {
      const total = transactions
        .filter((tx) => new Date(tx.date).getMonth() === index)
        .reduce((sum, tx) => sum + tx.amount, 0);
      return { name: month, amount: total };
    });
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      {/* 1. Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              F-insight
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Expense Tracker System
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          <span className="text-sm">New Expense</span>
        </button>
      </div>

      {/* 2. Summary & Analysis Section (상세 분석 리포트 추가) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">
            Monthly Spending
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">
              ${comparisonStats.thisTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-blue-600 text-[10px] font-black tracking-widest">CAD</span>
          </div>
        </div>

        {/* [NEW] 상세 분석 리포트 카드 */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">
                AI Monthly Analysis
              </p>
              <h3 className="text-xl font-bold leading-tight mb-4">
                {comparisonStats.isIncreased ? (
                  <>
                    You spent{' '}
                    <span className="text-rose-400 font-black">
                      ${Math.abs(comparisonStats.diff).toLocaleString()}
                    </span>{' '}
                    more
                    <br />
                    than last month.
                  </>
                ) : (
                  <>
                    You saved{' '}
                    <span className="text-emerald-400 font-black">
                      ${Math.abs(comparisonStats.diff).toLocaleString()}
                    </span>
                    <br />
                    compared to last month!
                  </>
                )}
              </h3>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 w-fit">
                <Award size={18} className="text-blue-400" />
                <span className="text-[11px] font-bold">
                  Top Category: <span className="text-blue-400">{comparisonStats.topCategory}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end justify-center gap-2">
              <div
                className={cn(
                  'px-6 py-4 rounded-[2rem] flex flex-col items-center justify-center min-w-[120px] shadow-2xl',
                  comparisonStats.isIncreased
                    ? 'bg-rose-500/10 border border-rose-500/20'
                    : 'bg-emerald-500/10 border border-emerald-500/20',
                )}
              >
                <div className="flex items-center gap-1">
                  {comparisonStats.isIncreased ? (
                    <ArrowUpRight className="text-rose-400" size={20} />
                  ) : (
                    <ArrowDownRight className="text-emerald-400" size={20} />
                  )}
                  <span
                    className={cn(
                      'text-3xl font-black',
                      comparisonStats.isIncreased ? 'text-rose-400' : 'text-emerald-400',
                    )}
                  >
                    {comparisonStats.percent}%
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase opacity-40 mt-1 tracking-tighter">
                  Vs Last Month
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">
                Last Mo: ${comparisonStats.lastTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Category Ratio
            </h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
              {currentMonthStr}
            </span>
          </div>
          <div className="h-[250px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-xs font-black uppercase tracking-widest">
                No data for this month
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {categoryData.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
            Spending Trend
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#cbd5e1' }}
                />
                <YAxis hide />
                <RechartsTooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none' }}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Transaction History */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
          <button
            onClick={() => navigate('/transaction')}
            className="flex items-center gap-2 text-blue-600 font-black text-[11px] uppercase tracking-widest hover:gap-3 transition-all"
          >
            View All Transactions <ArrowRight size={16} />
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Category
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Description
                  </th>
                  {/* Recipient 열 추가 */}
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Recipient
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTransactions.map((tx) => {
                  const catStyle = CATEGORY_COLORS[tx.category] || DEFAULT_COLOR;
                  return (
                    <tr
                      key={tx.id}
                      className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                      onClick={() => navigate('/transaction', { state: { selectedId: tx.id } })}
                    >
                      <td className="px-8 py-5 text-xs font-bold text-slate-400">{tx.date}</td>
                      <td className="px-8 py-5">
                        <span
                          className={cn(
                            'text-[9px] font-black px-2.5 py-1 rounded-lg uppercase',
                            catStyle.bg,
                            catStyle.text,
                          )}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-bold text-slate-900">{tx.title}</td>

                      {/* 1. Recipient 데이터 표시 (이름/이메일) */}
                      <td className="px-8 py-5 text-center text-[11px] font-bold text-slate-500 italic">
                        {tx.recipientName || tx.shareWith || (
                          <span className="text-slate-200 not-italic">-</span>
                        )}
                      </td>

                      {/* 2. Status 배지 표시 */}
                      <td className="px-8 py-5 text-center">
                        {tx.shareWith ? (
                          <StatusBadge status={tx.status || 'pending'} />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                            -
                          </span>
                        )}
                      </td>

                      <td className="px-8 py-5 text-right font-black text-slate-900">
                        -${tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
