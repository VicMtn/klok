import { BadgeButton } from "../badge/BadgeButton";

interface Props {
  title: string;
  onPrint?: () => void;
}

export function Header({ title, onPrint }: Props) {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white shrink-0">
      <h1 className="text-sm font-semibold text-gray-700">{title}</h1>
      <div className="flex items-center gap-4">
        <BadgeButton />
        {onPrint && (
          <button
            onClick={onPrint}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Imprimer
          </button>
        )}
      </div>
    </header>
  );
}
