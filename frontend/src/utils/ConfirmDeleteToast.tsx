import toast from 'react-hot-toast';
import { LuTrash2 } from 'react-icons/lu';

export const showDeleteConfirmation = (
  id: string,
  onConfirm: (id: string, toastId: string) => void,
) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto ring-1 ring-black ring-opacity-5 p-4 border border-slate-100`}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center">
              <LuTrash2 className="h-5 w-5 text-rose-500" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">Delete this expense?</p>
            <p className="mt-1 text-xs text-slate-500">This action cannot be undone.</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onConfirm(id, t.id)}
                className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => toast.remove(t.id)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
    { duration: 5000 },
  );
};
