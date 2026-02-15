import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyData {
  name: string;
  amount: number;
}

interface Props {
  data: MonthlyData[];
}

const SpendingBarChart = ({ data }: Props) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Spending Trend
        </h3>
      </div>

      {/* Chart */}
      <div className="h-64 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              padding={{ left: 15, right: 10 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: '#f8fafc', radius: 8 }}
              contentStyle={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '12px 16px',
              }}
              labelStyle={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#64748b',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
              itemStyle={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#2563eb',
              }}
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Spent']}
            />
            <Bar
              dataKey="amount"
              fill="#3b82f6"
              radius={[6, 6, 6, 6]}
              barSize={12}
              activeBar={{ fill: '#2563eb' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingBarChart;
