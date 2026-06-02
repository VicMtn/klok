import { useBadgeStore } from "../../store/useBadgeStore";
import { BadgeStateIndicator } from "./BadgeStateIndicator";
import { useT } from "../../i18n";

export function BadgeButton() {
  const state = useBadgeStore((s) => s.state);
  const stamp = useBadgeStore((s) => s.stamp);
  const t = useT();
  const isDone = state === 4;

  return (
    <div className="flex items-center gap-3">
      <BadgeStateIndicator state={state} />
      <button
        onClick={() => stamp()}
        disabled={isDone}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          isDone
            ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white cursor-pointer"
        }`}
      >
        {t.badge.actions[state]}
      </button>
    </div>
  );
}
