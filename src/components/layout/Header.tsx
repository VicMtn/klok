import { BadgeButton } from "../badge/BadgeButton";
import { useT } from "../../i18n";

interface Props {
  title: React.ReactNode;
  onPrint?: () => void;
  hideBadge?: boolean;
}

export function Header({ title, onPrint, hideBadge = false }: Props) {
  const t = useT();
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
      <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-100 flex items-baseline gap-2">{title}</h1>
      <div className="flex items-center gap-8">
        {!hideBadge && <BadgeButton />}
        {onPrint && (
          <button
            onClick={onPrint}
            className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {t.header.print}
          </button>
        )}
      </div>
    </header>
  );
}
