import { describe, it, expect } from "vitest";
import { calculateDay, calculateTotal, calculateBalance, calculateTotalWithHolidays } from "./calculations";
import type { TimeEntry, Holiday } from "../types/entry";

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

function holiday(date: string): Holiday {
  return { date, label: null };
}

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

  it("ignore une pause partielle (seulement break_start)", () => {
    const result = calculateDay(entry({
      arrival: "09:00",
      break_start: "12:00",
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
    const entries = [
      entry({ arrival: "09:00", departure: "17:00" }),
      entry({ date: "2024-01-16", arrival: "09:00", departure: "17:00" }),
    ];
    expect(calculateTotal(entries)).toBe(16);
  });

  it("ignore les entrées incomplètes", () => {
    const entries = [
      entry({ arrival: "09:00", departure: "17:00" }),
      entry({ date: "2024-01-16", arrival: "09:00" }),
    ];
    expect(calculateTotal(entries)).toBe(8);
  });

  it("retourne 0 pour un tableau vide", () => {
    expect(calculateTotal([])).toBe(0);
  });
});

describe("calculateBalance", () => {
  it("retourne 0 si heures exactement atteintes", () => {
    const entries = [entry({ arrival: "09:00", departure: "17:00" })];
    expect(calculateBalance(entries, 8)).toBe(0);
  });

  it("retourne un solde positif si heures dépassées", () => {
    const entries = [entry({ arrival: "09:00", departure: "18:00" })];
    expect(calculateBalance(entries, 8)).toBe(1);
  });

  it("retourne un solde négatif si heures insuffisantes", () => {
    const entries = [entry({ arrival: "09:00", departure: "16:00" })];
    expect(calculateBalance(entries, 8)).toBe(-1);
  });

  it("exclut les jours fériés du calcul", () => {
    const entries = [
      entry({ date: "2024-01-15", arrival: "09:00", departure: "17:00" }),
      entry({ date: "2024-01-16", arrival: "09:00", departure: "17:00" }),
    ];
    const holidays = [holiday("2024-01-16")];
    expect(calculateBalance(entries, 8, holidays)).toBe(0);
  });

  it("n'inclut pas les jours incomplets dans les heures attendues", () => {
    const entries = [
      entry({ arrival: "09:00", departure: "17:00" }),
      entry({ date: "2024-01-16", arrival: "09:00" }),
    ];
    expect(calculateBalance(entries, 8)).toBe(0);
  });
});

describe("calculateTotalWithHolidays", () => {
  it("ajoute les heures des jours fériés au total travaillé", () => {
    const entries = [entry({ arrival: "09:00", departure: "17:00" })];
    const holidays = [holiday("2024-01-16")];
    expect(calculateTotalWithHolidays(entries, holidays, 8)).toBe(16);
  });

  it("exclut les entrées dont la date est un jour férié", () => {
    const entries = [
      entry({ date: "2024-01-15", arrival: "09:00", departure: "17:00" }),
      entry({ date: "2024-01-16", arrival: "09:00", departure: "17:00" }),
    ];
    const holidays = [holiday("2024-01-16")];
    expect(calculateTotalWithHolidays(entries, holidays, 8)).toBe(16);
  });

  it("retourne 0 sans entrées ni fériés", () => {
    expect(calculateTotalWithHolidays([], [], 8)).toBe(0);
  });
});
