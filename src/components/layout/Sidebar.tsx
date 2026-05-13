import { useState } from "react";
import { SettingsModal } from "../settings/SettingsModal";
import { useThemeStore } from "../../store/useThemeStore";

interface NavItem {
  label: string;
  href: string;
}

interface Props {
  items: NavItem[];
  current: string;
  onNavigate: (href: string) => void;
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function Sidebar({ items, current, onNavigate }: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const { dark, toggle } = useThemeStore();

  return (
    <>
      <nav className="w-44 shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col py-4">
        <div className="px-4 mb-6">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">Klok</span>
        </div>
        <div className="flex-1 space-y-0.5 px-2">
          {items.map((item) => (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                current === item.href
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="px-2 border-t border-gray-200 dark:border-gray-700 pt-2 space-y-0.5">
          <button
            onClick={toggle}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
            {dark ? "Mode clair" : "Mode sombre"}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
          >
            Paramètres
          </button>
        </div>
      </nav>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
