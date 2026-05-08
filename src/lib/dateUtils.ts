export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function today(): string {
  return toISODate(new Date());
}

export function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );
  return { year: d.getFullYear(), week };
}

export function getISOWeeksInYear(year: number): number {
  return getISOWeek(new Date(year, 11, 28)).week;
}

export function getISOWeekDates(year: number, week: number): string[] {
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));

  const weekStart = new Date(startOfWeek1);
  weekStart.setDate(startOfWeek1.getDate() + (week - 1) * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return toISODate(d);
  });
}

export function getMonthDates(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  });
}

export function prevWeek(
  year: number,
  week: number
): { year: number; week: number } {
  if (week === 1) {
    return { year: year - 1, week: getISOWeeksInYear(year - 1) };
  }
  return { year, week: week - 1 };
}

export function nextWeek(
  year: number,
  week: number
): { year: number; week: number } {
  if (week === getISOWeeksInYear(year)) {
    return { year: year + 1, week: 1 };
  }
  return { year, week: week + 1 };
}

export function getDayName(dateStr: string, short = false): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("fr-FR", {
    weekday: short ? "short" : "long",
  });
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}
