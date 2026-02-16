import toast from 'react-hot-toast';
import { LuSend, LuLock } from 'react-icons/lu';

export const showShareConfirmation = (
  email: string,
  onConfirmShare: (toastId: string) => void,
  onDenyShare: (toastId: string) => void,
) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto ring-1 ring-black ring-opacity-5 p-5 border border-slate-100`}
      >
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <LuSend className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Request approval from {email}?</p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                If you send a request, the status will change to{' '}
                <span className="font-bold text-amber-500">Pending</span> until they accept.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onConfirmShare(t.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LuSend size={14} /> Send Request
            </button>
            <button
              onClick={() => onDenyShare(t.id)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LuLock size={14} /> Don't Share
            </button>
          </div>
        </div>
      </div>
    ),
    { duration: 8000 },
  ); // Longer duration so user has time to decide
};
