type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-72 border border-transparent dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-200 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
