import { LuAward, LuArrowUpRight, LuArrowDownRight } from 'react-icons/lu';

export interface ComparisonStats {
  thisTotal: number;
  lastTotal: number;
  diff: number;
  percent: number;
  isIncreased: boolean;
  topCategory: string;
}

interface DashboardStatsProps {
  comparisonStats: ComparisonStats;
}

export default function DashboardStats({ comparisonStats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Small Card: Current Month Total */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col justify-center h-full">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">
          Monthly Spending
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-slate-900">
            ${comparisonStats.thisTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-blue-600 text-[10px] font-black tracking-widest">CAD</span>
        </div>
      </div>

      {/* Big Card: AI Analysis & Comparison */}
      <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 h-full">
        {/* Ambient Background Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
          {/* Left Side: Text Analysis */}
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">
              AI Monthly Analysis
            </p>
            <h3 className="text-xl font-bold leading-tight mb-4">
              {comparisonStats.isIncreased ? (
                <>
                  You spent{' '}
                  <span className="text-rose-400 font-black">
                    ${Math.abs(comparisonStats.diff).toLocaleString()}
                  </span>{' '}
                  more
                  <br />
                  than last month.
                </>
              ) : (
                <>
                  You saved{' '}
                  <span className="text-emerald-400 font-black">
                    ${Math.abs(comparisonStats.diff).toLocaleString()}
                  </span>
                  <br />
                  compared to last month!
                </>
              )}
            </h3>

            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 w-fit backdrop-blur-sm">
              <LuAward size={18} className="text-blue-400" />
              <span className="text-[11px] font-bold">
                Top Category: <span className="text-blue-400">{comparisonStats.topCategory}</span>
              </span>
            </div>
          </div>

          {/* Right Side: Percentage Pill */}
          <div className="flex flex-col items-center md:items-end justify-center gap-2">
            <div
              className={`
                px-6 py-4 rounded-4xl flex flex-col items-center justify-center min-w-30 shadow-2xl backdrop-blur-md
                ${
                  comparisonStats.isIncreased
                    ? 'bg-rose-500/10 border border-rose-500/20'
                    : 'bg-emerald-500/10 border border-emerald-500/20'
                }
              `}
            >
              <div className="flex items-center gap-1">
                {comparisonStats.isIncreased ? (
                  <LuArrowUpRight className="text-rose-400" size={20} />
                ) : (
                  <LuArrowDownRight className="text-emerald-400" size={20} />
                )}
                <span
                  className={`
                    text-3xl font-black
                    ${comparisonStats.isIncreased ? 'text-rose-400' : 'text-emerald-400'}
                  `}
                >
                  {comparisonStats.percent}%
                </span>
              </div>
              <span className="text-[9px] font-black uppercase opacity-40 mt-1 tracking-tighter">
                Vs Last Month
              </span>
            </div>

            <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">
              Last Mo: ${comparisonStats.lastTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
