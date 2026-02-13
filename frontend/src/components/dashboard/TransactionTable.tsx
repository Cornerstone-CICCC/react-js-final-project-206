import { Search, SlidersHorizontal, Download, MoreVertical } from 'lucide-react';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';

const transactions = [
  {
    id: 1,
    date: 'Sep 10, 25',
    category: 'Food & Dining',
    description: 'Starbucks Coffee',
    amount: -8.5,
    balance: 12548,
  },
  {
    id: 2,
    date: 'Sep 09, 25',
    category: 'Salary',
    description: 'Monthly Income',
    amount: 2000.0,
    balance: 10628,
  },
  {
    id: 3,
    date: 'Sep 08, 25',
    category: 'Utilities',
    description: 'Electricity Bill',
    amount: -80.0,
    balance: 10548,
  },
  {
    id: 4,
    date: 'Sep 07, 25',
    category: 'Shopping',
    description: 'Starbucks Coffee',
    amount: -120.0,
    balance: 10348,
  },
];

export default function TransactionTable() {
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-50">
      {/* Table Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          Transaction History
          <span className="w-5 h-5 rounded-full border border-slate-200 text-[10px] flex items-center justify-center text-slate-400 font-normal">
            ?
          </span>
        </h3>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search input inside the table */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2 text-xs py-5">
            Type <SlidersHorizontal size={14} />
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-xs py-5">
            <Download size={14} /> Export
          </Button>
        </div>
      </div>

      {/* Actual table area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-xs font-medium border-b border-slate-50">
              <th className="pb-4 font-medium">Date</th>
              <th className="pb-4 font-medium">Category</th>
              <th className="pb-4 font-medium">Description</th>
              <th className="pb-4 font-medium">Amount</th>
              <th className="pb-4 font-medium">Balance</th>
              <th className="pb-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors"
              >
                <td className="py-4 text-slate-500 text-xs">{item.date}</td>
                <td className="py-4">
                  <span
                    className={cn(
                      'px-3 py-1 rounded-lg text-[11px] font-medium',
                      item.category === 'Salary'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-orange-50 text-orange-600',
                    )}
                  >
                    {item.category}
                  </span>
                </td>
                <td className="py-4 font-semibold text-slate-700">{item.description}</td>
                <td
                  className={cn(
                    'py-4 font-bold',
                    item.amount < 0 ? 'text-slate-900' : 'text-blue-600',
                  )}
                >
                  {item.amount < 0 ? `-$${Math.abs(item.amount)}` : `+$${item.amount}`}
                </td>
                <td className="py-4 text-slate-700 font-medium">
                  ${item.balance.toLocaleString()}
                </td>
                <td className="py-4 text-center">
                  <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
