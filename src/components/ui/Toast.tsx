import { useToastStore } from "../../store/useToastStore";

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 print:hidden">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className="flex items-start gap-3 max-w-sm rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/90 px-4 py-3 shadow-lg"
        >
          <span className="flex-1 text-sm text-red-700 dark:text-red-300">{toast.message}</span>
          <button
            onClick={() => dismiss(toast.id)}
            aria-label="dismiss"
            className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 text-sm leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
