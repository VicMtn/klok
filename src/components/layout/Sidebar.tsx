import { useState } from "react";
import { SettingsModal } from "../settings/SettingsModal";

interface NavItem {
  label: string;
  href: string;
}

interface Props {
  items: NavItem[];
  current: string;
  onNavigate: (href: string) => void;
}

export function Sidebar({ items, current, onNavigate }: Props) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <nav className="w-44 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col py-4">
        <div className="px-4 mb-6">
          <span className="text-xl font-bold text-blue-600 tracking-tight">Klok</span>
        </div>
        <div className="flex-1 space-y-0.5 px-2">
          {items.map((item) => (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                current === item.href
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="px-2 border-t border-gray-200 pt-2">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Paramètres
          </button>
        </div>
      </nav>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
