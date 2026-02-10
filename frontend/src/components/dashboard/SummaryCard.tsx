import { cn } from '../../lib/utils';

interface SummaryCardProps {
  title: string;
  amount: string;
  className?: string;
}

export default function SummaryCard({ title, amount, className }: SummaryCardProps) {
  return (
    <div
      className={cn(
        'bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col gap-2',
        className,
      )}
    >
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-slate-900 tracking-tight">${amount}</p>
    </div>
  );
}
