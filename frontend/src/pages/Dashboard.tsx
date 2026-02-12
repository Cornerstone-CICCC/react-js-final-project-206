import { useState, useMemo, useEffect } from 'react';
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
  Bell,
  Check,
  X,
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
import api from '../lib/api'; // Axios 인스턴스
import { socket } from '../lib/socket';
import toast from 'react-hot-toast';

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

function StatusBadge({ status }: { status: 'pending' | 'accepted' | 'declined' | 'personal' }) {
  const styles = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock, label: 'Pending' },
    accepted: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      icon: CheckCircle2,
      label: 'Accepted',
    },
    declined: { bg: 'bg-rose-50', text: 'text-rose-600', icon: XCircle, label: 'Declined' },
    personal: { bg: 'bg-slate-50', text: 'text-slate-400', icon: Clock, label: 'Personal' },
  };
  const currentStatus = status.toLowerCase() as keyof typeof styles;
  const { bg, text, icon: Icon, label } = styles[currentStatus] || styles.pending;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${bg} ${text} w-fit mx-auto`}>
      <Icon size={12} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { transactions, setTransactions } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  // 1. 초기 데이터 로드 (REST API)
  const fetchDashboardData = async () => {
    try {
      const [expensesRes, pendingRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/expenses/pending'),
      ]);
      setTransactions(expensesRes.data);
      setPendingRequests(pendingRes.data);
    } catch (error) {
      console.error('Data load failed', error);
    }
  };

  // 2. 실시간 소켓 리스너 설정
  useEffect(() => {
    fetchDashboardData();

    // 백엔드의 io.to(recipientId).emit('expense_update_received', ...) 구독
    socket.on('expense_update_received', (payload: any) => {
      toast.success(payload.message, { icon: '🔔' });
      // 리스트에 새 요청 즉시 추가 및 전체 데이터 갱신
      setPendingRequests((prev) => [payload.data, ...prev]);
      fetchDashboardData();
    });

    return () => {
      socket.off('expense_update_received');
    };
  }, []);

  // 3. 승인/거절 처리 (백엔드 PUT /expenses/:id/status 연동)
  const handleStatusUpdate = async (id: string, status: 'Accepted' | 'Rejected') => {
    try {
      await api.put(`/expenses/${id}/status`, { status });

      toast.success(status === 'Accepted' ? 'Expense accepted!' : 'Expense rejected');

      // UI 즉시 업데이트: Pending 목록에서 제거
      setPendingRequests((prev) => prev.filter((req) => req._id !== id));
      // 전체 트랜잭션 목록 새로고침
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // --- 기존 차트 및 요약 로직 유지 ---
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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

    const thisTotal = thisMonthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const lastTotal = lastMonthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const diff = thisTotal - lastTotal;
    const percent = lastTotal === 0 ? 0 : (diff / lastTotal) * 100;

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

      {/* 2. Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* AI Analysis Card */}
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
            </div>
          </div>
        </div>
      </div>

      {/* [Notification Center] Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[2.5rem] space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-blue-800 uppercase tracking-[0.2em] flex items-center gap-2">
              <Bell size={16} className="animate-bounce text-blue-600" /> Pending Invitations
            </h3>
            <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
              {pendingRequests.length} NEW
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white p-5 rounded-3xl shadow-sm border border-blue-200 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <span
                    className={cn(
                      'text-[9px] font-black px-2.5 py-1 rounded-lg uppercase',
                      CATEGORY_COLORS[req.category]?.bg,
                      CATEGORY_COLORS[req.category]?.text,
                    )}
                  >
                    {req.category}
                  </span>
                  <span className="font-black text-slate-900 text-lg">
                    ${req.amount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{req.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                    From: {req.paidBy?.firstName || 'Someone'}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleStatusUpdate(req._id, 'Accepted')}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-1 uppercase"
                  >
                    <Check size={14} /> Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                    className="flex-1 bg-slate-100 text-slate-500 py-2.5 rounded-xl text-[10px] font-black hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center gap-1 uppercase"
                  >
                    <X size={14} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Charts & History (기존과 동일) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
            Category Ratio
          </h3>
          <div className="h-[250px]">
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
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
            Spending Trend
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#cbd5e1' }}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 px-2">Recent Activity</h3>
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
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx._id || tx.id}
                    className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                  >
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={cn(
                          'text-[9px] font-black px-2.5 py-1 rounded-lg uppercase',
                          CATEGORY_COLORS[tx.category]?.bg,
                          CATEGORY_COLORS[tx.category]?.text,
                        )}
                      >
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-900">{tx.title}</td>
                    <td className="px-8 py-5 text-center">
                      {tx.shareWith ? (
                        // 'as any' 보다는 구체적인 타입 단언을 사용하는 것이 좋습니다.
                        <StatusBadge
                          status={
                            (tx.status?.toLowerCase() || 'pending') as
                              | 'pending'
                              | 'accepted'
                              | 'declined'
                          }
                        />
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
