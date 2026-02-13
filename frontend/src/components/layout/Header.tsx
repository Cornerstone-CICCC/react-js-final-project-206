import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Mic, Bell, Mail, Check, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

export default function Header() {
  const { transactions, updateTransactionStatus } = useTransactions();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    return transactions

      .filter(
        (tx) =>
          tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )

      .slice(0, 5);
  }, [searchQuery, transactions]);

  const pendingRequests = useMemo(() => {
    if (!auth.user?.email) return [];

    return transactions.filter(
      (tx) => tx.sharedWithEmail === auth.user?.email && tx.status === 'Pending',
    );
  }, [transactions, auth.user?.email]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotification(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = useMemo(() => {
    const first = auth.user?.firstName?.trim();

    const last = auth.user?.lastName?.trim();

    const full = [first, last].filter(Boolean).join(' ').trim();

    return full || auth.user?.email || 'User';
  }, [auth.user?.firstName, auth.user?.lastName, auth.user?.email]);

  const handleAccept = async (id: string) => {
    try {
      await updateTransactionStatus(id, 'Accepted');

      toast.success('Transaction accepted!');

      if (pendingRequests.length === 1) setShowNotification(false);
    } catch (err) {
      toast.error('Failed to accept');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await updateTransactionStatus(id, 'Rejected');

      toast.error('Request declined');

      if (pendingRequests.length === 1) setShowNotification(false);
    } catch (err) {
      toast.error('Failed to decline');
    }
  };

  return (
    <header className="flex items-center justify-between w-full pb-4 bg-surface-bg/80 backdrop-blur-md transition-all z-50">
      <div className="relative w-full max-w-md ml-2" ref={searchRef}>
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>

        <input
          type="text"
          placeholder="Type to search transactions..."
          className="w-full bg-white border border-slate-100 py-2.5 pl-11 pr-12 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm font-medium"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);

            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
        />

        {isSearchOpen && searchQuery && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3">
              {searchResults.length > 0 ? (
                searchResults.map((tx) => (
                  <div
                    key={tx._id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate('/transaction', { state: { selectedId: tx._id } });
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group text-left cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
                        {tx.title}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">
                        {tx.category} • {tx.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        ${tx.amount.toFixed(2)}
                      </span>

                      <ArrowRight
                        size={14}
                        className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    No results found
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="absolute inset-y-0 right-4 flex items-center cursor-pointer">
          <Mic className="h-4 w-4 text-slate-400 hover:text-blue-600 transition-colors" />
        </div>
      </div>

      <div className="flex items-center gap-6 mr-2">
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
                      key={req._id}
                      className="p-5 bg-white rounded-[1.8rem] border border-slate-50 shadow-sm hover:border-blue-100 transition-all group"
                    >
                      <div className="flex gap-4 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Mail size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-black text-slate-900 truncate tracking-tight">
                            {typeof req.paidBy === 'object' ? req.paidBy.email : 'Someone'}
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
                          onClick={() => handleAccept(req._id)}
                          className="flex-1 bg-slate-900 text-white text-[10px] font-black uppercase py-3 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <Check size={14} strokeWidth={3} /> Accept
                        </button>

                        <button
                          onClick={() => handleDecline(req._id)}
                          className="flex-1 bg-slate-100 text-slate-400 text-[10px] font-black uppercase py-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <X size={14} strokeWidth={3} /> Decline
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      No pending requests
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Link to="/profile" className="flex items-center gap-3 group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors tracking-tight">
              {displayName}
            </p>

            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-70">
              HELLO
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
