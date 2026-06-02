export const en = {
  nav: {
    week: "Week",
    month: "Month",
    stats: "Statistics",
  },
  sidebar: {
    lightMode: "Light mode",
    darkMode: "Dark mode",
    settings: "Settings",
    switchLang: "Français",
  },
  settings: {
    title: "Settings",
    hoursPerWeek: "Expected hours per week",
    cancel: "Cancel",
    save: "Save",
  },
  confirm: {
    cancel: "Cancel",
    confirm: "Confirm",
  },
  table: {
    day: "Day",
    arrival: "Arrival",
    breakStart: "Break →",
    breakDuration: "Break length",
    breakEnd: "← Return",
    departure: "Departure",
    netTime: "Net time",
    decimal: "Decimal",
    note: "Note",
    total: "Total",
  },
  entry: {
    holiday: "Holiday",
    holidayPlaceholder: "Holiday name (optional)",
    removeHoliday: "Remove holiday status",
    removeHolidayConfirm: "Remove holiday status for this day?",
    markHoliday: "Mark as holiday",
  },
  header: {
    print: "Print",
  },
  badge: {
    labels: ["Ready", "Working", "On break", "Back", "Done"] as string[],
    actions: ["Clock in", "Start break", "End break", "Clock out", "Day done"] as string[],
  },
  tray: {
    status: ["Ready", "Working", "On break", "Back", "Day done"] as string[],
    actions: ["Clock in", "Start break", "End break", "Clock out", "—"] as string[],
  },
  week: {
    label: "Week",
    today: "Today",
  },
  month: {
    today: "Today",
    names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as string[],
  },
  stats: {
    hoursWorked: "Hours worked",
    daysWorked: "Days worked",
    balance: "Balance",
    avgPerWeek: "Avg. per week",
    netHoursPerWeek: "Net hours per week",
    weekRangeGoal: (w: number, h: number) => `Weeks 1 to ${w} · target ${h}h / week`,
    daysUnit: (n: number) => `${n} d`,
  },
  print: {
    printedOn: (date: string) => `Printed on ${date}`,
  },
  comment: {
    placeholder: "Note...",
  },
  dateLocale: "en-GB",
};
