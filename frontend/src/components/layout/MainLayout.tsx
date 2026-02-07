import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    // 배경: brand-dark (다크 네이비)
    <div className="flex h-screen w-full bg-brand-dark p-4 gap-4 overflow-hidden">
      {/* 사이드바 자리: 나중에 A가 채울 예정 */}
      <aside className="w-64 flex-shrink-0 hidden md:block">
        <div className="h-full bg-transparent p-4">
          <h1 className="text-white text-2xl font-bold mb-8">F-insight</h1>
          {/* 사이드바 메뉴들이 들어갈 곳 */}
        </div>
      </aside>

      {/* 메인 콘텐츠 영역: 시안의 둥근 화이트/그레이 배경 부분 */}
      <main className="flex-1 bg-surface-bg rounded-[2.5rem] overflow-y-auto shadow-2xl relative">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
