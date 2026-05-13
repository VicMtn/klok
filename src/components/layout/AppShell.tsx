import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

const NAV_ITEMS = [
  { label: "Semaine", href: "week" },
  { label: "Mois", href: "month" },
  { label: "Statistiques", href: "stats" },
];

interface Props {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AppShell({ children, currentPage, onNavigate }: Props) {
  return (
    <div id="app-shell" className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar items={NAV_ITEMS} current={currentPage} onNavigate={onNavigate} />
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
}
