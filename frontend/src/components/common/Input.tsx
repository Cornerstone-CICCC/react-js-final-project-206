import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type = 'text', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}

        <input
          ref={ref}
          type={type}
          className={cn(
            'px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none transition-all w-full',
            'placeholder:text-slate-400 text-sm text-slate-900',
            'focus:border-brand-point focus:ring-2 focus:ring-blue-100',
            error && 'border-red-500 focus:ring-red-50',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 ml-1 mt-0.5 font-medium">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
