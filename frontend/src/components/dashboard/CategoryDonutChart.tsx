import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryDonutChartProps {
  data: CategoryData[];
  month: string;
}

const CategoryDonutChart = ({ data, month }: CategoryDonutChartProps) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Category Ratio
        </h3>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
          {month}
        </span>
      </div>

      {/* Chart */}
      <div className="h-64 w-full min-h-0 relative">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px 16px',
                  fontFamily: 'sans-serif',
                }}
                itemStyle={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  textTransform: 'capitalize',
                }}
                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-300">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-slate-200 animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-widest">No data</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDonutChart;
