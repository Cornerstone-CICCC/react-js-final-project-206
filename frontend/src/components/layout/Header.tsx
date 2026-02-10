import { useState, useEffect, useRef } from 'react';
import { Search, Mic, Bell, Mail, Check, X } from 'lucide-react';

export default function Header() {
  const [showNotification, setShowNotification] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // 알림 더미 데이터
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 101,
      senderEmail: 'partner@example.com',
      title: 'Dinner at Steakhouse',
      amount: 85.5,
    },
  ]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotification(false);
      }
    }

    if (showNotification) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotification]);

  const handleAccept = (id: number) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    setShowNotification(false);
  };

  const handleDecline = (id: number) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    setShowNotification(false);
  };

  return (
    <header className="flex items-center justify-between w-full mb-8 relative">
      {/* 1. 검색 영역 (Search Bar) */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Type to search"
          className="w-full bg-white border border-slate-100 py-2.5 pl-11 pr-12 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
        />
        <div className="absolute inset-y-0 right-4 flex items-center cursor-pointer">
          <Mic className="h-4 w-4 text-slate-400 hover:text-blue-600" />
        </div>
      </div>

      {/* 2. 사용자 프로필 및 알림 영역 */}
      <div className="flex items-center gap-6">
        {/* 알림 아이콘 & 드롭다운 (숫자 배지 적용) */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotification(!showNotification)}
            className={`relative p-2 text-slate-400 hover:bg-white hover:rounded-full transition-all shadow-sm ${showNotification ? 'bg-white rounded-full text-blue-600' : ''}`}
          >
            <Bell className="h-5 w-5" />
            {/* 숫자 알림 배지 */}
            {pendingRequests.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full px-1 border-2 border-white shadow-sm">
                {pendingRequests.length}
              </span>
            )}
          </button>

          {/* 알림 드롭다운 패널 */}
          {showNotification && (
            <div className="absolute right-0 mt-4 w-[320px] bg-white rounded-[2rem] shadow-2xl border border-slate-50 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Notifications
                </h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {pendingRequests.length} New
                </span>
              </div>

              <div className="max-h-[350px] overflow-y-auto p-2">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-white rounded-2xl mb-2 border border-slate-50 shadow-sm hover:border-blue-100 transition-colors"
                    >
                      <div className="flex gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                          <Mail size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-slate-900 truncate">
                            {req.senderEmail}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {req.title} •{' '}
                            <span className="text-blue-600 font-bold">
                              ${req.amount.toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(req.id)}
                          className="flex-1 bg-slate-900 text-white text-[9px] font-black uppercase py-2.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Check size={12} strokeWidth={4} /> Accept
                        </button>
                        <button
                          onClick={() => handleDecline(req.id)}
                          className="flex-1 bg-slate-100 text-slate-400 text-[9px] font-black uppercase py-2.5 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <X size={12} strokeWidth={4} /> Decline
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <div className="mb-2 flex justify-center text-slate-200">
                      <Bell size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      No New Requests
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 프로필 정보 */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">Trinh Phuong</p>
            <p className="text-[10px] text-slate-500 mt-1">Hello, Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
