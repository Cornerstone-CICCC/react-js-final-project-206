import { useState, useMemo, useEffect } from 'react';
import {
  LuChevronLeft,
  LuChevronRight,
  LuPlus,
  LuTrash2,
  LuCreditCard,
  LuArrowRight,
  LuCalendar,
} from 'react-icons/lu';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

import { getAllExpenses, deleteExpense, type IExpense } from '../api/expense';

import { showDeleteConfirmation } from '../utils/ConfirmDeleteToast';

import AddExpenseModal from '../components/expenses/AddExpenseModal';

export default function CalendarPage() {
  const navigate = useNavigate();

  // --- State ---
  const [transactions, setTransactions] = useState<IExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Fetch Data ---
  const loadData = async () => {
    try {
      const data = await getAllExpenses();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load expenses', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- DELETE LOGIC ---
  const executeDelete = async (id: string, toastId: string) => {
    toast.remove(toastId); // Close the toast first

    // Optimistic Update
    const previousTransactions = [...transactions];
    setTransactions((prev) => prev.filter((tx) => tx._id !== id));

    const success = await deleteExpense(id);

    if (success) {
      toast.success('Expense deleted');
    } else {
      toast.error('Failed to delete');
      setTransactions(previousTransactions); // Revert
    }
  };

  // --- Calendar Logic ---
  const normalizeDate = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  };

  const selectedDayTransactions = useMemo(() => {
    const target = normalizeDate(selectedDate);
    return transactions.filter((tx) => normalizeDate(tx.date) === target);
  }, [transactions, selectedDate]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days, year, month };
  }, [currentMonth]);

  const handleDateClick = (day: number) => {
    const formattedDate = `${daysInMonth.year}-${String(daysInMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
  };

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newMonth);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-400 font-bold animate-pulse">Loading Calendar...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in duration-500 p-8">
      {/* --- Left: Calendar Grid --- */}
      <div className="flex-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 h-fit">
        <div className="flex justify-between items-center mb-8 px-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LuCalendar className="text-blue-600 mb-1" />
            {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
            >
              <LuChevronLeft size={20} />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
            >
              <LuChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInMonth.firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth.days }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${daysInMonth.year}-${String(daysInMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const hasData = transactions.some((tx) => normalizeDate(tx.date) === dateStr);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200
                  ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105 z-10' : 'hover:bg-slate-50 text-slate-600'}
                `}
              >
                <span className="text-sm font-bold">{day}</span>
                {hasData && !isSelected && (
                  <div className="absolute bottom-2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Right: Detail Panel --- */}
      <div className="w-full lg:w-100 flex flex-col gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex-1 flex flex-col min-h-125">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Spending Log
              </p>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              <LuPlus size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {selectedDayTransactions.length > 0 ? (
              selectedDayTransactions.map((tx) => (
                <div
                  key={tx._id}
                  onClick={() => navigate(`/transactions/${tx._id}`)}
                  className="group flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-white transition-colors">
                      <LuCreditCard size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 mb-0.5 truncate group-hover:text-blue-700 transition-colors">
                        {tx.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          {tx.category}
                        </p>
                        <LuArrowRight
                          size={10}
                          className="text-slate-300 group-hover:text-blue-400 transition-all group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-sm font-black text-slate-900">
                      ${Number(tx.amount).toFixed(2)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showDeleteConfirmation(tx._id, executeDelete);
                      }}
                      className="p-1.5 text-slate-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <LuTrash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2 opacity-60">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-2">
                  <LuPlus size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-center">
                  No spending recorded
                </p>
              </div>
            )}
          </div>

          {selectedDayTransactions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Day Total
                </span>
                <span className="text-2xl font-black text-blue-600">
                  $
                  {selectedDayTransactions
                    .reduce((acc, cur) => acc + Number(cur.amount), 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          loadData();
        }}
        initialDate={selectedDate}
      />
    </div>
  );
}
