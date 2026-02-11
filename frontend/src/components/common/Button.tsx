import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils'; // 아래 유틸리티 함수 확인

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    // 기본 베이스 스타일 (시안의 둥근 느낌 반영)
    const baseStyles =
      'inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

    // 시안 기반 배리언트 설정
    const variants = {
      // "Share" 버튼 스타일 (메인 블루)
      primary: 'bg-brand-point text-white hover:bg-blue-600 shadow-sm',
      // "View Analytics" 버튼 스타일 (다크 배경 위 화이트)
      secondary: 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm',
      // 대시보드 내 "Export" 버튼 스타일
      outline: 'bg-transparent border border-gray-200 text-gray-700 hover:bg-gray-50',
      // 아이콘 전용 혹은 배경 없는 버튼
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
      // 사이드바 하단 등 강조용
      dark: 'bg-brand-dark text-white hover:bg-slate-800',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-5 text-sm',
      lg: 'h-12 px-8 text-base',
      icon: 'h-10 w-10', // 정사각형 아이콘 버튼용
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
