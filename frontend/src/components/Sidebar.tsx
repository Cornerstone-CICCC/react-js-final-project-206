import { useState, useEffect } from 'react';
import {
  LuLayoutDashboard,
  LuCalendar as CalendarIcon,
  LuReceiptText,
  LuLogOut,
  LuMenu,
  LuX,
  LuClock,
  LuTrendingUp,
} from 'react-icons/lu';
import { useNavigate, NavLink } from 'react-router';
import toast from 'react-hot-toast';

import { useUserStore } from '../store/user.store';

const menuItems = [
  { name: 'Dashboard', icon: LuLayoutDashboard, path: '/' },
  { name: 'Calendar', icon: CalendarIcon, path: '/calendar' },
  { name: 'Transactions', icon: LuReceiptText, path: '/transactions' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useUserStore();

  const [isOpen, setIsOpen] = useState(false);
  const [vancouverTime, setVancouverTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const time = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Vancouver',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date());
      setVancouverTime(time);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
    closeSidebar();
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-5 left-5 z-110 p-2.5 bg-slate-900 rounded-xl text-white shadow-lg hover:bg-slate-800 transition-colors"
      >
        {isOpen ? <LuX size={20} /> : <LuMenu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-100 w-72 h-full flex flex-col 
          bg-[#0F1115] text-slate-400 p-8 border-r border-slate-800/50 
          transition-transform duration-300 ease-in-out 
          lg:translate-x-0 lg:static
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <LuTrendingUp className="text-white w-5 h-5" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">F-Insight</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <p className="text-[11px] font-black text-slate-600 tracking-[0.2em] mb-6 px-3 uppercase select-none">
            Management
          </p>
          <ul className="space-y-2 list-none m-0 p-0">
            {menuItems.map((item) => (
              <li key={item.name}>
                {/* NavLink handles the 'isActive' logic automatically */}
                <NavLink
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 px-4 py-4 rounded-2xl 
                    transition-all duration-300 group relative no-underline
                    ${
                      isActive
                        ? 'bg-blue-600/10 text-white shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]'
                        : 'hover:bg-slate-800/40 hover:text-slate-200 text-slate-400'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-full" />
                      )}

                      <item.icon
                        size={22}
                        className={`transition-colors ${
                          isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="text-[15px] font-bold">{item.name}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-4">
          <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-800/50">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <LuClock size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Vancouver, BC</span>
            </div>
            <div className="text-white font-mono font-bold text-lg leading-none">
              {vancouverTime || 'Loading...'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
          >
            <LuLogOut size={22} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-[15px] font-bold">Log out</span>
          </button>

          <span className="text-sm">&copy;F-Insight 2026. All rights reserved.</span>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-90 lg:hidden animate-in fade-in duration-300"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
