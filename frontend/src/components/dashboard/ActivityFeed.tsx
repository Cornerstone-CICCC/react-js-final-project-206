import { ShoppingBag, Coffee, Car } from 'lucide-react';

const activities = [
  {
    id: 1,
    icon: Coffee,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    title: 'Starbucks',
    time: '5 mins ago',
    amount: '-$8.50',
  },
  {
    id: 2,
    icon: ShoppingBag,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    title: 'Amazon',
    time: '2 hours ago',
    amount: '-$45.00',
  },
  {
    id: 3,
    icon: Car,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    title: 'Uber',
    time: '5 hours ago',
    amount: '-$12.50',
  },
];

export default function ActivityFeed() {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50">
      <h3 className="text-sm font-bold text-slate-900 mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {activities.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}
              >
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{item.title}</p>
                <p className="text-[10px] text-slate-500">{item.time}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-900">{item.amount}</span>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-2 text-[11px] font-bold text-brand-point hover:underline">
        View All Activity
      </button>
    </div>
  );
}
