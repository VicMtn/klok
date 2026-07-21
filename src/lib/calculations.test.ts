import { describe, it, expect } from "vitest";
import {
  calculateDay,
  calculateTotal,
  periodForDate,
  dailyTarget,
  weeklyTarget,
  totalWithCredits,
  cumulativeBalance,
} from "./calculations";
import type { TimeEntry, SpecialDay, SpecialDayType, ActivityPeriod } from "../types/entry";

function entry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    date: "2024-01-15",
    arrival: null,
    break_start: null,
    break_end: null,
    departure: null,
    comment: null,
    ...overrides,
  };
}

function special(date: string, type: SpecialDayType): SpecialDay {
  return { date, type };
}

function period(effectiveFrom: string, ratePct: number, days: number): ActivityPeriod {
  return { effective_from: effectiveFrom, activity_rate: ratePct / 100, worked_days_per_week: days };
}

// A worked day from 09:00 spanning `netHours` (no break), rounded to the minute.
function worked(date: string, netHours: number): TimeEntry {
  const end = 9 * 60 + Math.round(netHours * 60);
  const hh = String(Math.floor(end / 60)).padStart(2, "0");
  const mm = String(end % 60).padStart(2, "0");
  return entry({ date, arrival: "09:00", departure: `${hh}:${mm}` });
}

// Mon..Fri of ISO week 3, 2024 (2024-01-01 is a Monday, so 01-15 is a Monday too).
const MON = "2024-01-15";
const TUE = "2024-01-16";
const WED = "2024-01-17";
const THU = "2024-01-18";
const FRI = "2024-01-19";
// Monday of the following ISO week.
const NEXT_MON = "2024-01-22";
const NEXT_TUE = "2024-01-23";
const NEXT_WED = "2024-01-24";

// Full time: 100% on 5 days. With reference 40 → daily 8, weekly 40.
const FULL = [period("1970-01-01", 100, 5)];

describe("calculateDay", () => {
  it("retourne isComplete=false si arrivée ou départ manquant", () => {
    expect(calculateDay(entry({ arrival: "09:00" })).isComplete).toBe(false);
    expect(calculateDay(entry({ departure: "18:00" })).isComplete).toBe(false);
    expect(calculateDay(entry()).isComplete).toBe(false);
  });

  it("calcule une journée sans pause", () => {
    const result = calculateDay(entry({ arrival: "09:00", departure: "17:00" }));
    expect(result.isComplete).toBe(true);
    expect(result.gross).toBe(480);
    expect(result.breakDuration).toBe(0);
    expect(result.net).toBe(480);
    expect(result.netDecimal).toBe(8);
  });

  it("calcule une journée avec pause", () => {
    const result = calculateDay(entry({
      arrival: "09:00",
      break_start: "12:00",
      break_end: "13:00",
      departure: "18:00",
    }));
    expect(result.breakDuration).toBe(60);
    expect(result.net).toBe(480);
    expect(result.netDecimal).toBe(8);
  });

  it("ignore une pause mal formée (break_end avant break_start)", () => {
    const result = calculateDay(entry({
      arrival: "09:00",
      break_start: "13:00",
      break_end: "12:00",
      departure: "18:00",
    }));
    expect(result.breakDuration).toBe(0);
    expect(result.netDecimal).toBe(9);
  });

  it("retourne net=0 si départ avant arrivée", () => {
    const result = calculateDay(entry({ arrival: "18:00", departure: "09:00" }));
    expect(result.net).toBe(0);
    expect(result.netDecimal).toBe(0);
  });

  it("arrondit netDecimal à 2 décimales", () => {
    const result = calculateDay(entry({ arrival: "09:00", departure: "17:10" }));
    expect(result.netDecimal).toBe(8.17);
  });
});

describe("calculateTotal", () => {
  it("somme les heures nettes de plusieurs entrées", () => {
    expect(calculateTotal([worked(MON, 8), worked(TUE, 8)])).toBe(16);
  });

  it("ignore les entrées incomplètes", () => {
    expect(calculateTotal([worked(MON, 8), entry({ date: TUE, arrival: "09:00" })])).toBe(8);
  });

  it("retourne 0 pour un tableau vide", () => {
    expect(calculateTotal([])).toBe(0);
  });
});

describe("periodForDate", () => {
  const periods = [period("2026-01-01", 100, 5), period("2026-07-01", 60, 3)];

  it("retourne null sans période", () => {
    expect(periodForDate([], "2026-01-01")).toBeNull();
  });

  it("retombe sur la plus ancienne pour une date antérieure", () => {
    expect(periodForDate(periods, "2025-12-31")).toBe(periods[0]);
  });

  it("résout la période applicable à une date", () => {
    expect(periodForDate(periods, "2026-06-30")!.activity_rate).toBe(1);
    expect(periodForDate(periods, "2026-07-01")!.activity_rate).toBeCloseTo(0.6);
    expect(periodForDate(periods, "2026-08-15")!.worked_days_per_week).toBe(3);
  });
});

describe("dailyTarget / weeklyTarget", () => {
  it("cible semaine = référence × taux", () => {
    expect(weeklyTarget(41, period("x", 60, 3))).toBeCloseTo(24.6);
  });

  it("cible jour = cible semaine / jours travaillés (60%/3j = 8.2)", () => {
    expect(dailyTarget(41, period("x", 60, 3))).toBeCloseTo(8.2);
  });

  it("même taux, répartition différente (60%/5j = 4.92)", () => {
    expect(dailyTarget(41, period("x", 60, 5))).toBeCloseTo(4.92);
  });

  it("100%/5j = référence / 5", () => {
    expect(dailyTarget(40, period("x", 100, 5))).toBe(8);
  });

  it("retourne 0 sans période", () => {
    expect(dailyTarget(40, null)).toBe(0);
    expect(weeklyTarget(40, null)).toBe(0);
  });
});

describe("totalWithCredits", () => {
  it("somme les heures travaillées", () => {
    expect(totalWithCredits([worked(MON, 8), worked(TUE, 8)], [], 40, FULL)).toBe(16);
  });

  it("crédite un jour férié à hauteur de la cible du jour", () => {
    const entries = [worked(MON, 8)];
    expect(totalWithCredits(entries, [special(TUE, "holiday")], 40, FULL)).toBe(16);
  });

  it("crédite vacances payées et maladie", () => {
    const entries = [worked(MON, 8)];
    expect(totalWithCredits(entries, [special(TUE, "paid")], 40, FULL)).toBe(16);
    expect(totalWithCredits(entries, [special(TUE, "sick")], 40, FULL)).toBe(16);
  });

  it("ne crédite pas une récupération (heures déjà pointées)", () => {
    const entries = [worked(MON, 8)];
    expect(totalWithCredits(entries, [special(TUE, "overtime")], 40, FULL)).toBe(8);
  });

  it("exclut l'entrée dont la date est un jour spécial", () => {
    const entries = [worked(MON, 8), worked(TUE, 8)];
    expect(totalWithCredits(entries, [special(TUE, "holiday")], 40, FULL)).toBe(16);
  });
});

describe("cumulativeBalance — modèle hebdomadaire strict", () => {
  it("semaine complète à 100%/5j → solde 0", () => {
    const week = [worked(MON, 8), worked(TUE, 8), worked(WED, 8), worked(THU, 8), worked(FRI, 8)];
    expect(cumulativeBalance(week, [], 40, FULL)).toBe(0);
  });

  it("ignore une semaine vide (aucun jour actif)", () => {
    expect(cumulativeBalance([], [], 40, FULL)).toBe(0);
    // Une entrée incomplète ne rend pas la semaine active.
    expect(cumulativeBalance([entry({ date: MON, arrival: "09:00" })], [], 40, FULL)).toBe(0);
  });

  describe("60%/3j (référence 41, cible semaine 24.6, jour 8.2)", () => {
    const P = [period("1970-01-01", 60, 3)];

    it("pointe 3 jours → solde 0", () => {
      const week = [worked(MON, 8.2), worked(TUE, 8.2), worked(WED, 8.2)];
      expect(cumulativeBalance(week, [], 41, P)).toBeCloseTo(0);
    });

    it("pointe 4 jours → heures sup +8.2", () => {
      const week = [worked(MON, 8.2), worked(TUE, 8.2), worked(WED, 8.2), worked(THU, 8.2)];
      expect(cumulativeBalance(week, [], 41, P)).toBeCloseTo(8.2);
    });

    it("pointe 2 jours → déficit -8.2", () => {
      const week = [worked(MON, 8.2), worked(TUE, 8.2)];
      expect(cumulativeBalance(week, [], 41, P)).toBeCloseTo(-8.2);
    });

    it("1 férié + 2 jours pointés → neutre (0)", () => {
      const week = [worked(TUE, 8.2), worked(WED, 8.2)];
      expect(cumulativeBalance(week, [special(MON, "holiday")], 41, P)).toBeCloseTo(0);
    });

    it("1 récupération + 2 jours pointés → -8.2 (consomme l'avance)", () => {
      const week = [worked(TUE, 8.2), worked(WED, 8.2)];
      expect(cumulativeBalance(week, [special(MON, "overtime")], 41, P)).toBeCloseTo(-8.2);
    });
  });

  it("cumule chaque semaine avec sa propre cible (changement de taux)", () => {
    // 100%/5j jusqu'au 22/01, puis 60%/3j. Référence 40.
    const periods = [period("1970-01-01", 100, 5), period(NEXT_MON, 60, 3)];
    const w3 = [worked(MON, 8), worked(TUE, 8), worked(WED, 8)]; // 24h sous cible 40 → -16
    const w4 = [worked(NEXT_MON, 8), worked(NEXT_TUE, 8), worked(NEXT_WED, 8)]; // 24h sous cible 24 → 0
    expect(cumulativeBalance(w3, [], 40, periods)).toBeCloseTo(-16);
    expect(cumulativeBalance(w4, [], 40, periods)).toBeCloseTo(0);
    // Combinées : chaque semaine facturée selon sa période.
    expect(cumulativeBalance([...w3, ...w4], [], 40, periods)).toBeCloseTo(-16);
  });

  it("arrondit le solde à 2 décimales", () => {
    const b = cumulativeBalance([worked(MON, 8.33)], [], 41, [period("1970-01-01", 60, 7)]);
    expect(Number.isInteger(Math.round(b * 100))).toBe(true);
    expect(b).toBe(Math.round(b * 100) / 100);
  });
});
