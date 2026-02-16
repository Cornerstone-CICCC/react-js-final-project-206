import toast from 'react-hot-toast';
import { LuDollarSign } from 'react-icons/lu';

export const showExpenseToast = (partnerName: string, item: string, amount: number) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-slate-50`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <LuDollarSign size={20} />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-slate-900">New Expense from {partnerName}</p>
              <p className="mt-1 text-xs text-slate-500">
                Spent <span className="font-semibold text-blue-600">${amount}</span> on "{item}"
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-slate-100">
          <button
            onClick={() => toast.remove(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    ),
    { duration: 5000 },
  );
};
