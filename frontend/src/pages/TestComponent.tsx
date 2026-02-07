import { Button } from '../components/common/Button';
import { Share2, BarChart2, Download, Mail, Lock } from 'lucide-react';
import { Input } from '../components/common/Input';

export default function TestComponent() {
  return (
    <div className="min-h-screen bg-brand-dark p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* 헤더 섹션 */}
        <header className="border-b border-slate-700 pb-5">
          <h1 className="text-4xl font-bold">Design System Check</h1>
          <p className="text-slate-400 mt-2">
            Tailwind Config 및 공통 컴포넌트 적용 상태를 확인합니다.
          </p>
        </header>

        {/* 1. 컬러 시스템 확인 (중요!) */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-brand-point">
            <span className="w-2 h-6 bg-brand-point rounded-full"></span>
            1. Color Config Check
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-brand-point text-white text-center font-bold">
              brand-point (#3B82F6)
            </div>
            <div className="p-4 rounded-xl bg-brand-dark border border-slate-600 text-white text-center font-bold">
              brand-dark (#0F172A)
            </div>
            <div className="p-4 rounded-xl bg-surface-bg text-gray-900 text-center font-bold">
              surface-bg (#F8FAFC)
            </div>
            <div className="p-4 rounded-xl bg-white text-gray-900 text-center font-bold shadow-lg">
              White / Shadow Check
            </div>
          </div>
          <p className="text-sm text-slate-400">
            ※ 위 박스들에 색이 안 보인다면 tailwind.config.js 설정을 확인하세요.
          </p>
        </section>

        {/* 2. 버튼 컴포넌트 확인 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Button Components</h2>
          <div className="bg-white p-8 rounded-2xl flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary (Share)</Button>
            <Button variant="secondary">Secondary (White)</Button>
            <Button variant="dark">Dark Button</Button>
            <Button variant="outline" className="gap-2">
              <Download size={18} /> Export
            </Button>
            <Button variant="primary" isLoading>
              Loading State
            </Button>
          </div>
        </section>

        {/* 3. 입력창 컴포넌트 확인 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. Input Components</h2>
          <div className="bg-white p-8 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Email Address"
              placeholder="name@example.com"
              className="text-gray-900" // 텍스트 컬러 명시
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error="비밀번호가 일치하지 않습니다."
              className="text-gray-900"
            />
          </div>
        </section>

        {/* 4. 시안 레이아웃 미리보기 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Layout Mockup</h2>
          <div className="bg-surface-bg p-6 rounded-[2rem] h-40 flex items-center justify-center border-4 border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">Main Content Area (A's Work Area)</p>
          </div>
        </section>
      </div>
    </div>
  );
}
