import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

// Input 컴포넌트가 가질 수 있는 추가 속성 정의
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type = 'text', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* 라벨이 있을 경우에만 렌더링 */}
        {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}

        <input
          ref={ref}
          type={type}
          className={cn(
            // 기본 스타일: 시안의 둥근 모서리와 연한 테두리 반영
            'px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none transition-all w-full',
            'placeholder:text-slate-400 text-sm text-slate-900',
            // 포커스 시: 시안의 브랜드 블루 포인트 컬러 적용
            'focus:border-brand-point focus:ring-2 focus:ring-blue-100',
            // 에러 시: 빨간색 테두리와 강조
            error && 'border-red-500 focus:ring-red-50',
            className,
          )}
          {...props}
        />

        {/* 에러 메시지가 있을 경우 하단에 표시 */}
        {error && <p className="text-xs text-red-500 ml-1 mt-0.5 font-medium">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
