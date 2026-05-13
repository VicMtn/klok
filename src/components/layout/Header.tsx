import { BadgeButton } from "../badge/BadgeButton";

interface Props {
  title: React.ReactNode;
  onPrint?: () => void;
  hideBadge?: boolean;
}

export function Header({ title, onPrint, hideBadge = false }: Props) {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white shrink-0">
      <h1 className="text-lg font-semibold text-gray-700 flex items-baseline gap-2">{title}</h1>
      <div className="flex items-center gap-8">
        {!hideBadge && <BadgeButton />}
        {onPrint && (
          <button
            onClick={onPrint}
            className="text-xs bg-gray-200 px-3 py-1.5 rounded text-gray-600 hover:text-gray-600 transition-colors"
          >
            Imprimer
          </button>
        )}
      </div>
    </header>
  );
}
