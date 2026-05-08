import { useBadgeStore } from "../../store/useBadgeStore";
import { BadgeStateIndicator } from "./BadgeStateIndicator";

export function BadgeButton() {
  const state = useBadgeStore((s) => s.state);
  const stamp = useBadgeStore((s) => s.stamp);
  const nextLabel = useBadgeStore((s) => s.nextLabel);
  const isDone = state === 4;

  return (
    <div className="flex items-center gap-3">
      <BadgeStateIndicator state={state} />
      <button
        onClick={() => stamp()}
        disabled={isDone}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          isDone
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        }`}
      >
        {nextLabel()}
      </button>
    </div>
  );
}
