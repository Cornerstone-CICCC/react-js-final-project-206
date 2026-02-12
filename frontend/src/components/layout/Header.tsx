import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Mic, Bell, Mail, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../../context/TransactionContext'; // Context 연결
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export default function Header() {
  const { addTransaction } = useTransactions();
  const { auth } = useAuth();

  const [showNotification, setShowNotification] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // ✅ 우상단 표시용 이름 (실제 로그인 유저 기반)
  const displayName = useMemo(() => {
    const first = auth.user?.firstName?.trim();
    const last = auth.user?.lastName?.trim();
    const full = [first, last].filter(Boolean).join(' ').trim();
    return full || auth.user?.email || 'User';
  }, [auth.user?.firstName, auth.user?.lastName, auth.user?.email]);

  const subtitle = useMemo(() => {
    // 원래 디자인 톤 유지: "HELLO, ADMIN" 같은 느낌을 유지하되, role 없으니 기본 "HELLO"
    // (원하면 email 기반으로 더 자연스럽게 바꿔줄 수도 있음)
    return 'HELLO';
  }, []);

  // 1. 대기 중인 요청 데이터 (카테고리 및 날짜 정보 포함)
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 101,
      senderEmail: 'partner@example.com',
      title: 'Dinner at Steakhouse',
      amount: 85.5,
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: 102,
      senderEmail: 'sarah@test.com',
      title: 'Uber to Airport',
      amount: 42.2,
      category: 'Transport',
      date: new Date().toISOString().split('T')[0],
    },
  ]);

  // 바깥 영역 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotification(false);
      }
    }
    if (showNotification) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotification]);

  // 2. 수락 로직: Context에 추가 후 목록에서 제거
  const handleAccept = (req: (typeof pendingRequests)[0]) => {
    addTransaction({
      title: `[Shared] ${req.title}`,
      amount: req.amount,
      category: req.category,
      date: req.date,
      shareWith: req.senderEmail,
      memo: `${req.senderEmail}로부터 승인된 요청`,
      status: 'accepted', // 상태를 accepted로 명시
    });

    setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));

    // 알림이 하나도 없으면 자동으로 창 닫기 (선택사항)
    if (pendingRequests.length === 1) {
      setShowNotification(false);
    }
  };

  const handleDecline = (id: number) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    if (pendingRequests.length === 1) setShowNotification(false);
  };

  return (
    <header className="flex items-center justify-between w-full pb-4 bg-surface-bg/80 backdrop-blur-md transition-all z-50">
      {/* Search Bar */}
      <div className="relative w-full max-w-md ml-2">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Type to search"
          className="w-full bg-white border border-slate-100 py-2.5 pl-11 pr-12 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm font-medium"
        />
        <div className="absolute inset-y-0 right-4 flex items-center cursor-pointer">
          <Mic className="h-4 w-4 text-slate-400 hover:text-blue-600 transition-colors" />
        </div>
      </div>

      {/* Actions 영역 */}
      <div className="flex items-center gap-6 mr-2">
        {/* 알림 섹션 */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotification(!showNotification)}
            className={cn(
              'relative p-2.5 text-slate-400 hover:bg-white hover:rounded-full transition-all shadow-sm',
              showNotification ? 'bg-white rounded-full text-blue-600 ring-4 ring-blue-50' : '',
            )}
          >
            <Bell className="h-5 w-5" />
            {pendingRequests.length > 0 && (
              <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {pendingRequests.length}
              </span>
            )}
          </button>

          {/* 알림 드롭다운 */}
          {showNotification && (
            <div className="absolute right-0 mt-4 w-[340px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Notifications
                </h3>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                  {pendingRequests.length} New Requests
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 bg-white rounded-[1.8rem] border border-slate-50 shadow-sm hover:border-blue-100 transition-all group"
                    >
                      <div className="flex gap-4 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Mail size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-black text-slate-900 truncate tracking-tight">
                            {req.senderEmail}
                          </p>
                          <p className="text-[11px] font-bold text-slate-400 mt-1">
                            {req.title} •{' '}
                            <span className="text-blue-600 font-black">
                              ${req.amount.toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(req)}
                          className="flex-1 bg-slate-900 text-white text-[10px] font-black uppercase py-3 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <Check size={14} strokeWidth={3} /> Accept
                        </button>
                        <button
                          onClick={() => handleDecline(req.id)}
                          className="flex-1 bg-slate-100 text-slate-400 text-[10px] font-black uppercase py-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <X size={14} strokeWidth={3} /> Decline
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell size={20} className="text-slate-200" />
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                      Everything is clear
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <Link to="/profile" className="flex items-center gap-3 group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors tracking-tight">
              {displayName}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-70">
              {subtitle}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm cursor-pointer group-hover:ring-4 group-hover:ring-blue-50 transition-all">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
