import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { AppShell } from "./components/layout/AppShell";
import { WeekView } from "./pages/WeekView";
import { MonthView } from "./pages/MonthView";
import { StatsView } from "./pages/StatsView";
import { VacationView } from "./pages/VacationView";
import { PrintView } from "./components/print/PrintView";
import { ToastContainer } from "./components/ui/Toast";
import { useSettingsStore } from "./store/useSettingsStore";
import { useBadgeStore } from "./store/useBadgeStore";
import { useLocaleStore } from "./store/useLocaleStore";
import { getT } from "./i18n";
import { getISOWeek } from "./lib/dateUtils";

type Page = "week" | "month" | "vacation" | "stats";

function App() {
  const load = useSettingsStore((s) => s.load);
  const badgeState = useBadgeStore((s) => s.state);
  const locale = useLocaleStore((s) => s.locale);
  const [page, setPage] = useState<Page>("week");

  const now = new Date();
  const { year: currentYear, week: currentWeek } = getISOWeek(now);

  const [weekNav, setWeekNav] = useState({ year: currentYear, week: currentWeek });
  const [monthNav, setMonthNav] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  // Init settings + schedule a single wake-up at midnight instead of polling
  useEffect(() => {
    load();

    let timer: ReturnType<typeof setTimeout>;
    const scheduleMidnightReset = () => {
      const n = new Date();
      const midnight = new Date(n);
      midnight.setHours(24, 0, 0, 0);
      timer = setTimeout(() => {
        useBadgeStore.getState().hydrate(undefined);
        scheduleMidnightReset();
      }, midnight.getTime() - n.getTime());
    };
    scheduleMidnightReset();

    return () => clearTimeout(timer);
  }, []);

  // Tray stamp button → badge store handles it; tray menu updates via the
  // badgeState effect below.
  useEffect(() => {
    const p = listen<void>("tray-stamp", () => useBadgeStore.getState().stamp());
    return () => {
      p.then((unlisten) => unlisten());
    };
  }, []);

  // Keep tray menu in sync whenever badge state or locale changes
  useEffect(() => {
    const t = getT();
    invoke("update_tray", {
      status: t.tray.status[badgeState],
      nextAction: t.tray.actions[badgeState],
      isDone: badgeState === 4,
    }).catch(() => {});
  }, [badgeState, locale]);

  return (
    <>
      <AppShell currentPage={page} onNavigate={(p) => setPage(p as Page)}>
        {page === "week" ? (
          <WeekView
            year={weekNav.year}
            week={weekNav.week}
            onNavigate={(year, week) => setWeekNav({ year, week })}
          />
        ) : page === "month" ? (
          <MonthView
            year={monthNav.year}
            month={monthNav.month}
            onNavigate={(year, month) => setMonthNav({ year, month })}
          />
        ) : page === "vacation" ? (
          <VacationView />
        ) : (
          <StatsView />
        )}
      </AppShell>
      <PrintView />
      <ToastContainer />
    </>
  );
}

export default App;
