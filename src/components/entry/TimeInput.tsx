import { useState, useRef } from "react";
import { normalizeTimeInput } from "../../lib/formatting";

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
  warning?: boolean;
}

export function TimeInput({ value, onChange, warning }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    const raw = draft !== null ? draft : (value ?? "");
    const normalized = raw.trim() ? normalizeTimeInput(raw) : null;
    setDraft(null);
    if (normalized !== value) onChange(normalized);
  };

  return (
    <input
      ref={ref}
      type="text"
      value={draft !== null ? draft : (value ?? "")}
      placeholder="--:--"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      className={`w-14 text-center text-sm font-mono border rounded px-1 py-0.5 focus:outline-none focus:ring-1 bg-transparent dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 ${
        warning
          ? "border-amber-400 focus:ring-amber-400"
          : "border-gray-200 dark:border-gray-600 focus:ring-blue-400 dark:focus:ring-blue-500"
      }`}
    />
  );
}
