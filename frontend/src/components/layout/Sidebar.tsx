import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  ReceiptText,
  LogOut,
  Menu,
  X,
  Clock,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Calendar", icon: CalendarIcon, path: "/calendar" },
  { name: "Transaction", icon: ReceiptText, path: "/transaction" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { clearAuth, refreshAuth } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [vancouverTime, setVancouverTime] = useState("");

  // 밴쿠버 시간 실시간 업데이트 (디테일 요소)
  useEffect(() => {
    const timer = setInterval(() => {
      const time = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Vancouver",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());
      setVancouverTime(time);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const handleLogout = async () => {
    try {
      // 백엔드에 로그아웃 엔드포인트가 있으면 호출 (없어도 프론트 로그아웃은 가능)
      await api.post("/users/logout").catch(() => {});
    } finally {
      clearAuth(); // ✅ 전역 유저 상태 제거
      await refreshAuth(); // ✅ 세션 재확인(정리)
      toast.success("Logged out!");
      navigate("/login", { replace: true });
      closeSidebar();
    }
  };

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-5 left-5 z-[110] p-2.5 bg-slate-900 rounded-xl text-white shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* 사이드바 본체 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[100] w-72 h-full flex flex-col bg-[#0F1115] text-slate-400 p-8 border-r border-slate-800/50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* 브랜드 로고 */}
        <div className="flex items-center gap-2 px-2 mb-10">
          <div className="w-8 h-8 bg-brand-point rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">F-insight</span>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="flex-1 space-y-2">
          <p className="text-[11px] font-black text-slate-600 tracking-[0.2em] mb-6 px-3 uppercase">
            Management
          </p>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      closeSidebar();
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative",
                      isActive
                        ? "bg-blue-600/10 text-white shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]"
                        : "hover:bg-slate-800/40 hover:text-slate-200",
                    )}
                  >
                    {/* 활성화 표시 바 */}
                    {isActive && <div className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-full" />}

                    <item.icon
                      size={22}
                      className={cn(
                        "transition-colors",
                        isActive ? "text-blue-500" : "text-slate-500 group-hover:text-slate-300",
                      )}
                    />
                    <span className="text-[15px] font-bold">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 하단 섹션: 밴쿠버 시간 & 로그아웃 */}
        <div className="mt-auto space-y-4">
          {/* 밴쿠버 타임 위젯 */}
          <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-800/50">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Clock size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Vancouver, BC</span>
            </div>
            <div className="text-white font-mono font-bold text-lg leading-none">
              {vancouverTime || "Loading..."}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
          >
            <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-[15px] font-bold">Log out</span>
          </button>
        </div>
      </aside>

      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
