import { useState, useMemo } from 'react';
import { Plus, TrendingUp, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
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
import { cn } from '../lib/utils'; // cn 헬퍼 함수가 있다고 가정합니다.

// TransactionPage와 동일한 색상 팔레트 정의
const CATEGORY_COLORS: { [key: string]: { bg: string; text: string; chart: string } } = {
  Food: { bg: 'bg-orange-50', text: 'text-orange-600', chart: '#f97316' },
  Transport: { bg: 'bg-blue-50', text: 'text-blue-600', chart: '#2563eb' },
  Rent: { bg: 'bg-purple-50', text: 'text-purple-600', chart: '#a855f7' },
  Household: { bg: 'bg-emerald-50', text: 'text-emerald-600', chart: '#10b981' },
  Health: { bg: 'bg-rose-50', text: 'text-rose-600', chart: '#f43f5e' },
  Education: { bg: 'bg-indigo-50', text: 'text-indigo-600', chart: '#6366f1' },
  Other: { bg: 'bg-slate-50', text: 'text-slate-600', chart: '#64748b' },
};

// 기본색 (카테고리가 정의되지 않았을 경우)
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

  // 1. 현재 달 계산 (YYYY-MM 형식)
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // 2. 차트 데이터 가공: 이번 달(Current Month) 카테고리 비율만 계산
  const categoryData = useMemo(() => {
    // 이번 달에 해당하는 트랜잭션만 필터링
    const currentMonthTransactions = transactions.filter((tx) => {
      // tx.date가 "2024-05-20" 형식이라고 가정할 때 앞의 7글자(YYYY-MM) 비교
      return tx.date.startsWith(currentMonthStr);
    });

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

  const totalSpending = transactions.reduce((acc, cur) => acc + cur.amount, 0);

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
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">
            Monthly Spending
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              ${totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-blue-600 text-[10px] font-black tracking-widest">CAD</span>
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
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
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
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                No data for this month
              </div>
            )}
          </div>
          {categoryData.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {categoryData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {/* 카테고리 색상 점 */}
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] font-bold text-slate-700">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
            Spending Trend
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <YAxis hide />
                <RechartsTooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none' }}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Transaction History */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-lg font-black text-slate-900">Transaction History</h3>
          <button
            onClick={() => navigate('/transaction')}
            className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-left border-collapse">
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
                {recentTransactions.map((tx) => {
                  const catStyle = CATEGORY_COLORS[tx.category] || DEFAULT_COLOR;
                  return (
                    <tr
                      key={tx.id}
                      className="group hover:bg-slate-50/30 transition-colors cursor-pointer"
                      onClick={() => navigate('/transaction', { state: { selectedId: tx.id } })}
                    >
                      <td className="px-8 py-5 text-xs font-bold text-slate-400 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={cn(
                            'text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter',
                            catStyle.bg,
                            catStyle.text,
                          )}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-bold text-slate-900 truncate max-w-[200px]">
                        {tx.title}
                      </td>
                      <td className="px-8 py-5 text-center text-xs font-medium text-slate-500 italic">
                        {tx.recipientName || tx.shareWith || '-'}
                      </td>
                      <td className="px-8 py-5 text-center">
                        {tx.shareWith ? (
                          <StatusBadge status={tx.status || 'pending'} />
                        ) : (
                          <span className="text-slate-300">-</span>
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
