import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useT } from "../../i18n";

interface Props {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AppShell({ children, currentPage, onNavigate }: Props) {
  const t = useT();
  const navItems = [
    { label: t.nav.week, href: "week" },
    { label: t.nav.month, href: "month" },
    { label: t.nav.stats, href: "stats" },
  ];

  return (
    <div id="app-shell" className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar items={navItems} current={currentPage} onNavigate={onNavigate} />
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
}
