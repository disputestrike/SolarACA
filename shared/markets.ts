import { z } from "zod";

/** Public brand name — use everywhere user-facing copy references the organization */
export const BRAND_NAME = "National Solar Sales Academy" as const;

/**
 * Hiring territories as "ST - City" (e.g. FL - Orlando).
 * Single source of truth for apply form, APIs, and dashboard filters.
 */
export const MARKET_TERRITORIES = [
  "FL - Orlando",
  "FL - Tampa",
  "TX - Dallas",
  "TX - Houston",
  "TX - San Antonio",
  "SC - Columbia",
  "SC - Charleston",
  "SC - Greenville",
  "NC - Charlotte",
  "NC - Raleigh",
  "NC - Greensboro",
  "GA - Atlanta",
  "GA - Augusta",
  "GA - Savannah",
] as const;

export type MarketTerritory = (typeof MARKET_TERRITORIES)[number];

export const marketTerritoryZodEnum = z.enum(MARKET_TERRITORIES);

/** Waitlist / talent capture allows an extra "Other" bucket */
export const WAITLIST_CITY_VALUES = [...MARKET_TERRITORIES, "Other"] as const;
export type WaitlistCity = (typeof WAITLIST_CITY_VALUES)[number];
export const waitlistCityZodEnum = z.enum(WAITLIST_CITY_VALUES);

export const MARKET_TERRITORY_COUNT = MARKET_TERRITORIES.length;

/** Full state names for supported two-letter codes (hiring regions) */
export const STATE_CODE_TO_NAME: Record<string, string> = {
  FL: "Florida",
  TX: "Texas",
  SC: "South Carolina",
  NC: "North Carolina",
  GA: "Georgia",
};

/**
 * Parse stored market string "ST - City" (e.g. "FL - Orlando").
 * Legacy rows may be city-only (e.g. "Tampa") — returned as city with empty state.
 */
export function parseMarketTerritory(territory: string): {
  stateCode: string;
  stateName: string;
  city: string;
  raw: string;
} {
  const raw = territory.trim();
  const sep = " - ";
  if (!raw.includes(sep)) {
    return { stateCode: "", stateName: "", city: raw, raw };
  }
  const idx = raw.indexOf(sep);
  const stateCode = raw.slice(0, idx).trim();
  const city = raw.slice(idx + sep.length).trim();
  return {
    stateCode,
    stateName: STATE_CODE_TO_NAME[stateCode] ?? stateCode,
    city,
    raw,
  };
}

/** One line for UI: "Orlando, Florida" */
export function formatApplicantLocation(territory: string): string {
  const p = parseMarketTerritory(territory);
  if (!p.stateCode) return p.city;
  return `${p.city}, ${p.stateName}`;
}

/** Short: "Orlando, FL" */
export function formatApplicantLocationShort(territory: string): string {
  const p = parseMarketTerritory(territory);
  if (!p.stateCode) return p.city;
  return `${p.city}, ${p.stateCode}`;
}

/** Group territories by state for UI (labels, selects) */
export function marketsGroupedByState(): {
  stateCode: string;
  stateName: string;
  items: { territory: MarketTerritory; label: string }[];
}[] {
  const byState = new Map<string, MarketTerritory[]>();
  for (const t of MARKET_TERRITORIES) {
    const code = t.split(" - ")[0] ?? "";
    if (!byState.has(code)) byState.set(code, []);
    byState.get(code)!.push(t);
  }
  return Array.from(byState.entries()).map(([stateCode, items]) => ({
    stateCode,
    stateName: STATE_CODE_TO_NAME[stateCode] ?? stateCode,
    items: items.map((territory) => ({ territory, label: territory })),
  }));
}
