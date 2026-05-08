import { useState } from "react";

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function CommentInput({ value, onChange }: Props) {
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
      placeholder="Note..."
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      className="w-full text-xs text-gray-500 bg-transparent border-none focus:outline-none placeholder-gray-300"
    />
  );
}
