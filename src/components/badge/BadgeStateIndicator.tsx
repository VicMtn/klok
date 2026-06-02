import type { BadgeState } from "../../store/useBadgeStore";
import { useT } from "../../i18n";

const DOT_COLOR: Record<BadgeState, string> = {
  0: "bg-gray-400",
  1: "bg-green-500",
  2: "bg-amber-400",
  3: "bg-blue-500",
  4: "bg-gray-300 dark:bg-gray-600",
};

export function BadgeStateIndicator({ state }: { state: BadgeState }) {
  const t = useT();
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block w-2 h-2 rounded-full ${DOT_COLOR[state]}`} />
      <span className="text-xs text-gray-500 dark:text-gray-400">{t.badge.labels[state]}</span>
    </div>
  );
}
