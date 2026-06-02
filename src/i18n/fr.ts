export const fr = {
  nav: {
    week: "Semaine",
    month: "Mois",
    stats: "Statistiques",
  },
  sidebar: {
    lightMode: "Mode clair",
    darkMode: "Mode sombre",
    settings: "Paramètres",
    switchLang: "English",
  },
  settings: {
    title: "Paramètres",
    hoursPerWeek: "Heures attendues par semaine",
    cancel: "Annuler",
    save: "Enregistrer",
  },
  confirm: {
    cancel: "Annuler",
    confirm: "Confirmer",
  },
  table: {
    day: "Jour",
    arrival: "Arrivée",
    breakStart: "Pause →",
    breakDuration: "Durée pause",
    breakEnd: "← Retour",
    departure: "Départ",
    netTime: "Temps net",
    decimal: "Décimal",
    note: "Note",
    total: "Total",
  },
  entry: {
    holiday: "Férié",
    holidayPlaceholder: "Nom du jour férié (optionnel)",
    removeHoliday: "Retirer le statut férié",
    removeHolidayConfirm: "Retirer le statut férié de ce jour ?",
    markHoliday: "Marquer comme jour férié",
  },
  header: {
    print: "Imprimer",
  },
  badge: {
    labels: ["Prêt", "Au travail", "En pause", "De retour", "Terminé"] as string[],
    actions: ["Arrivée", "Début pause", "Retour pause", "Départ", "Journée terminée"] as string[],
  },
  tray: {
    status: ["Prêt", "Au travail", "En pause", "De retour", "Journée terminée"] as string[],
    actions: ["Arrivée", "Début pause", "Retour pause", "Départ", "—"] as string[],
  },
  week: {
    label: "Semaine",
    today: "Aujourd'hui",
  },
  month: {
    today: "Aujourd'hui",
    names: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"] as string[],
  },
  stats: {
    hoursWorked: "Heures travaillées",
    daysWorked: "Jours travaillés",
    balance: "Balance",
    avgPerWeek: "Moy. par semaine",
    netHoursPerWeek: "Heures nettes par semaine",
    weekRangeGoal: (w: number, h: number) => `Semaines 1 à ${w} · objectif ${h}h / semaine`,
    daysUnit: (n: number) => `${n} j`,
  },
  print: {
    printedOn: (date: string) => `Imprimé le ${date}`,
  },
  comment: {
    placeholder: "Note...",
  },
  dateLocale: "fr-FR",
};
