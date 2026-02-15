import { useState, useEffect, useRef, useMemo } from 'react';
import { useNotificationStore } from '../store/notification.store';
import {
  LuSearch,
  LuMic,
  LuBell,
  LuMail,
  LuX,
  LuCheck,
  LuLoaderCircle,
  LuReceipt,
  LuArrowRight,
} from 'react-icons/lu';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';

import { respondToExpense, getAllExpenses, type IExpense } from '../api/expense';
import { useUserStore } from '../store/user.store';
import { useUIStore } from '../store/ui.store';

export default function TopHeader() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { triggerRefresh } = useUIStore();

  // Local State
  const [showNotification, setShowNotification] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IExpense[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const { pendingRequests, fetchNotifications, removeNotification } = useNotificationStore();

  // Load data once on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearchDropdown(false);

    navigate(`/transactions?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleResultClick = (id: string) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/transactions/${id}`);
  };

  // --- Live Search Logic ---
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        setShowSearchDropdown(true);
        try {
          // Fetch ALL expenses (No params passed)
          const response = await getAllExpenses();

          // Handle potential response structures
          const allExpenses = Array.isArray(response) ? response : (response as any).expenses || [];

          // Filter in memory (Case-insensitive)
          const lowerQuery = searchQuery.toLowerCase();
          const filtered = allExpenses.filter(
            (item: IExpense) =>
              (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
              (item.category && item.category.toLowerCase().includes(lowerQuery)),
          );

          // Slice top 5 results
          setSearchResults(filtered.slice(0, 5));
        } catch (error) {
          console.error('Search failed', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // --- Click Outside Handler ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotification(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccept = async (id: string) => {
    const success = await respondToExpense(id, 'Accepted');
    if (success) {
      toast.success('Transaction accepted!');
      removeNotification(id);
      triggerRefresh();
      if (pendingRequests.length === 1) setShowNotification(false);
    } else {
      toast.error('Failed to accept');
    }
  };

  const handleDecline = async (id: string) => {
    const success = await respondToExpense(id, 'Rejected');
    if (success) {
      toast.error('Request declined');
      removeNotification(id);
      triggerRefresh();
      if (pendingRequests.length === 1) setShowNotification(false);
    } else {
      toast.error('Failed to decline');
    }
  };

  const displayName = useMemo(() => {
    if (!user) return 'User';
    const first = user.firstName?.trim();
    const last = user.lastName?.trim();
    const full = [first, last].filter(Boolean).join(' ').trim();
    return full || user.email || 'User';
  }, [user]);

  return (
    <header className="flex items-center justify-between w-full pb-4 px-8 pt-6 bg-white/80 backdrop-blur-md transition-all z-50 sticky top-0">
      {/* Search Bar */}
      <div className="relative w-full max-w-md ml-2">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <LuSearch className="h-4 w-4 text-slate-400" />
        </div>

        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Type to search transactions..."
            className="w-full bg-white border border-slate-100 py-2.5 pl-11 pr-12 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm font-medium"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            onFocus={() => searchQuery && setShowSearchDropdown(true)}
          />
        </form>

        <div className="absolute inset-y-0 right-4 flex items-center">
          {isSearching ? (
            <LuLoaderCircle className="h-4 w-4 text-blue-600 animate-spin" />
          ) : (
            <LuMic className="h-4 w-4 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" />
          )}
        </div>

        {/* --- Search Dropdown --- */}
        {showSearchDropdown && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-4xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
            {/* Header / Loading State */}
            {isSearching ? (
              <div className="p-6 text-center text-slate-400 text-xs font-bold animate-pulse">
                Searching transactions...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                <p className="px-5 py-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Best Matches
                </p>

                {/* Result Items */}
                {searchResults.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleResultClick(item._id)}
                    className="mx-2 px-3 py-3 hover:bg-blue-50 rounded-2xl cursor-pointer group transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                        <LuReceipt size={14} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 whitespace-nowrap">
                      ${Number(item.amount).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="h-px bg-slate-50 my-2 mx-4" />

                {/* See All Link */}
                <button
                  onClick={handleSearchSubmit}
                  className="w-full text-left px-5 py-3 text-xs font-bold text-blue-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  See all results for "{searchQuery}" <LuArrowRight size={12} />
                </button>
              </div>
            ) : (
              // Empty State
              <div className="p-8 text-center">
                <p className="text-sm font-bold text-slate-900">No results found</p>
                <p className="text-xs text-slate-400 mt-1">Try searching for a different keyword</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 mr-2">
        {/* Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotification(!showNotification)}
            className={`
              relative p-2.5 text-slate-400 hover:bg-white hover:rounded-full transition-all shadow-sm
              ${showNotification ? 'bg-white rounded-full text-blue-600 ring-4 ring-blue-50' : ''}
            `}
          >
            <LuBell className="h-5 w-5" />
            {pendingRequests.length > 0 && (
              <span className="absolute top-0 right-0 min-w-4.5 h-4.5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {pendingRequests.length}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotification && (
            <div className="absolute right-0 mt-4 w-85 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-100 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Notifications
                </h3>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                  {pendingRequests.length} New Requests
                </span>
              </div>

              <div className="max-h-100 overflow-y-auto p-3 space-y-2">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-5 bg-white rounded-[1.8rem] border border-slate-50 shadow-sm hover:border-blue-100 transition-all group"
                    >
                      <div className="flex gap-4 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <LuMail size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-black text-slate-900 truncate tracking-tight">
                            {(req.paidBy as any)?.email || 'Someone'} shared an expense
                          </p>
                          <p className="text-[11px] font-bold text-slate-400 mt-1">
                            {req.title} •{' '}
                            <span className="text-blue-600 font-black">
                              ${Number(req.amount).toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(req._id)}
                          className="flex-1 bg-slate-900 text-white text-[10px] font-black uppercase py-3 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <LuCheck size={14} strokeWidth={3} /> Accept
                        </button>
                        <button
                          onClick={() => handleDecline(req._id)}
                          className="flex-1 bg-slate-100 text-slate-400 text-[10px] font-black uppercase py-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <LuX size={14} strokeWidth={3} /> Decline
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

        {/* Profile Link */}
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
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
