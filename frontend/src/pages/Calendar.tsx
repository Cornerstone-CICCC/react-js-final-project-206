import { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { ChevronLeft, ChevronRight, Plus, Trash2, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';
// 1. 모달 컴포넌트 임포트
import AddTransactionModal from '../components/dashboard/AddTransactionModal';

export default function CalendarPage() {
  const { transactions, deleteTransaction } = useTransactions();

  // 오늘 날짜 포맷팅 (YYYY-MM-DD)
  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // 2. 모달 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedDayTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date === selectedDate);
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

  // 월 이동 로직 수정 (버그 방지)
  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in duration-500">
      {/* 왼쪽: 달력 메인 */}
      <div className="flex-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div className="flex justify-between items-center mb-8 px-2">
          <h2 className="text-xl font-black text-slate-900">
            {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
            >
              <ChevronRight size={20} />
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
            const hasData = transactions.some((tx) => tx.date === dateStr);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  'relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200',
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105 z-10'
                    : 'hover:bg-slate-50 text-slate-600',
                )}
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

      {/* 오른쪽: 지출 상세 내역 */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex-1 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Spending Log
              </p>
              <h3 className="text-lg font-bold text-slate-900">{selectedDate}</h3>
            </div>
            {/* 3. 플러스 버튼에 모달 열기 연결 */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200 active:scale-95"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {selectedDayTransactions.length > 0 ? (
              selectedDayTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-1">{tx.title}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {tx.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-black text-slate-900">${tx.amount.toFixed(2)}</p>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2 opacity-60">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-2">
                  <Plus size={20} />
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
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Day Total
                </span>
                <span className="text-xl font-black text-blue-600">
                  ${selectedDayTransactions.reduce((acc, cur) => acc + cur.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. 모달 추가 (selectedDate를 초기값으로 넘겨줄 수 있음) */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialDate={selectedDate} // 이 옵션을 AddTransactionModal에서 받도록 수정하면 최고입니다!
      />
    </div>
  );
}
