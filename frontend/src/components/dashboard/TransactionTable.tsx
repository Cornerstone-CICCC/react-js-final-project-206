import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Download, MoreVertical, Tag, Calendar } from 'lucide-react';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';
import { useTransactions } from '../../context/TransactionContext';

export default function TransactionTable() {
  // 1. Context에서 실제 데이터 가져오기
  const { transactions } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');

  // 2. 데이터 필터링 및 최신순 정렬 로직
  const sortedTransactions = useMemo(() => {
    return [...transactions]
      .filter(
        (tx) =>
          tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery]);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
      {/* 테이블 상단 헤더 & 컨트롤 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            You have {sortedTransactions.length} transactions this period
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-100 hover:bg-slate-50"
          >
            <Download size={16} />
          </Button>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
              <th className="pb-4 px-2">Date</th>
              <th className="pb-4 px-2">Category</th>
              <th className="pb-4 px-2">Description</th>
              <th className="pb-4 px-2">Amount</th>
              <th className="pb-4 px-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((tx) => (
                <tr
                  key={tx._id || tx.id}
                  className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="py-5 px-2">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-bold">
                        {new Date(tx.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(tx.date).getFullYear()}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-2">
                    <span
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-tight',
                        tx.category === 'Food'
                          ? 'bg-orange-50 text-orange-600'
                          : tx.category === 'Transport'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-5 px-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{tx.title}</span>
                      {tx.note && (
                        <span className="text-xs text-slate-400 truncate max-w-[150px]">
                          {tx.note}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-5 px-2">
                    <span
                      className={cn(
                        'font-black text-base',
                        tx.amount > 0 ? 'text-blue-600' : 'text-slate-900',
                      )}
                    >
                      {tx.amount > 0
                        ? `+$${tx.amount.toFixed(2)}`
                        : `-$${Math.abs(tx.amount).toFixed(2)}`}
                    </span>
                  </td>
                  <td className="py-5 px-2 text-center">
                    <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-400 font-medium">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
