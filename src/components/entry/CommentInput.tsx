import { useState } from "react";
import { useT } from "../../i18n";

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function CommentInput({ value, onChange }: Props) {
  const t = useT();
  const [draft, setDraft] = useState<string | null>(null);

  const handleBlur = () => {
    const v = draft !== null ? draft : (value ?? "");
    setDraft(null);
    const normalized = v.trim() || null;
    if (normalized !== value) onChange(normalized);
  };

  return (
    <input
      type="text"
      value={draft !== null ? draft : (value ?? "")}
      placeholder={t.comment.placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      className="w-full text-xs text-gray-500 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
    />
  );
}
