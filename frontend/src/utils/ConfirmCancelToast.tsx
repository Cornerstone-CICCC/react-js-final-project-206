import toast from 'react-hot-toast';
import { LuCircleX } from 'react-icons/lu';

export const showCancelInviteConfirmation = (onConfirm: (toastId: string) => void) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto ring-1 ring-black ring-opacity-5 p-4 border border-slate-100`}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
              <LuCircleX className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">Cancel Invitation?</p>
            <p className="mt-1 text-xs text-slate-500">
              The other user will no longer see this transaction.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onConfirm(t.id)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => toast.remove(t.id)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                No, Keep it
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
    { duration: 5000 },
  );
};
