export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDecimalHours(decimal: number): string {
  if (decimal === 0) return "—";
  const sign = decimal < 0 ? "-" : "";
  const abs = Math.abs(decimal);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${sign}${h}h${m > 0 ? String(m).padStart(2, "0") : ""}`;
}

export function formatBalance(balance: number): string {
  if (balance === 0) return "±0h";
  const sign = balance > 0 ? "+" : "";
  return `${sign}${formatDecimalHours(balance)}`;
}

export function normalizeTimeInput(raw: string): string | null {
  const clean = raw.replace(/[^0-9:]/g, "");
  if (!clean) return null;

  let h: number, m: number;

  if (clean.includes(":")) {
    const parts = clean.split(":");
    h = parseInt(parts[0] || "0", 10);
    m = parseInt(parts[1] || "0", 10);
  } else if (clean.length <= 2) {
    h = parseInt(clean, 10);
    m = 0;
  } else if (clean.length === 3) {
    h = parseInt(clean[0], 10);
    m = parseInt(clean.slice(1), 10);
  } else {
    h = parseInt(clean.slice(0, 2), 10);
    m = parseInt(clean.slice(2, 4), 10);
  }

  if (isNaN(h) || isNaN(m) || h > 23 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
