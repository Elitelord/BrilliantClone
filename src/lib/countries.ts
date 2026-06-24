// Real(istic), textbook-level demographic time series for the country model in
// Lesson 1. Rates are crude birth/death per 1,000 people per year; population is
// in millions. Figures are rounded historical estimates (UN / Our World in Data
// style) - close enough to show each country's transition, not exact statistics.
import { clamp } from './dtm';
import type { Trend } from '../types/content';
import { trendFromGap } from './dtm';

export interface CountryYearPoint {
  year: number;
  birth: number;
  death: number;
  pop: number; // millions
}

export interface CountryData {
  id: string;
  name: string;
  flag: string;
  tagline: string;
  series: CountryYearPoint[];
}

// Shared axis ceiling so curves are comparable across tabs.
export const COUNTRY_RATE_MAX = 50;
export const MILLIONS_PER_ICON = 10;

const england: CountryData = {
  id: 'england',
  name: 'England',
  flag: '🏴',
  tagline: 'A full transition over three centuries',
  series: [
    { year: 1700, birth: 32, death: 31, pop: 5.2 },
    { year: 1750, birth: 35, death: 31, pop: 5.8 },
    { year: 1800, birth: 35, death: 24, pop: 8.7 },
    { year: 1850, birth: 34, death: 21, pop: 16.8 },
    { year: 1900, birth: 29, death: 18, pop: 30.5 },
    { year: 1950, birth: 16, death: 12, pop: 41.0 },
    { year: 2000, birth: 11, death: 10, pop: 49.2 },
    { year: 2021, birth: 10, death: 9, pop: 56.5 },
  ],
};

const nigeria: CountryData = {
  id: 'nigeria',
  name: 'Nigeria',
  flag: '🇳🇬',
  tagline: 'Early in the transition - rapid growth',
  series: [
    { year: 1950, birth: 46, death: 27, pop: 37.9 },
    { year: 1970, birth: 46, death: 21, pop: 55.6 },
    { year: 1990, birth: 45, death: 18, pop: 95.2 },
    { year: 2000, birth: 43, death: 16, pop: 122.9 },
    { year: 2010, birth: 41, death: 14, pop: 160.9 },
    { year: 2020, birth: 37, death: 12, pop: 208.3 },
    { year: 2023, birth: 35, death: 11, pop: 223.8 },
  ],
};

const japan: CountryData = {
  id: 'japan',
  name: 'Japan',
  flag: '🇯🇵',
  tagline: 'Late in the transition - now shrinking',
  series: [
    { year: 1950, birth: 28, death: 11, pop: 83.2 },
    { year: 1970, birth: 19, death: 7, pop: 104.7 },
    { year: 1990, birth: 10, death: 7, pop: 123.6 },
    { year: 2005, birth: 8.4, death: 8.6, pop: 127.8 },
    { year: 2010, birth: 8.5, death: 9.5, pop: 128.1 },
    { year: 2020, birth: 6.8, death: 11.1, pop: 126.3 },
    { year: 2023, birth: 6.0, death: 13.0, pop: 124.5 },
  ],
};

export const COUNTRIES: Record<string, CountryData> = { england, nigeria, japan };

export const COUNTRY_ORDER = ['england', 'nigeria', 'japan'];

export function getCountry(id: string): CountryData {
  return COUNTRIES[id] ?? england;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface CountrySample {
  year: number;
  birth: number;
  death: number;
  gap: number;
  pop: number;
  trend: Trend;
}

// Interpolate a country's rates + population at a fractional year.
export function sampleCountry(c: CountryData, year: number): CountrySample {
  const first = c.series[0];
  const last = c.series[c.series.length - 1];
  const y = clamp(year, first.year, last.year);

  let lo = first;
  let hi = last;
  for (let i = 0; i < c.series.length - 1; i++) {
    if (y >= c.series[i].year && y <= c.series[i + 1].year) {
      lo = c.series[i];
      hi = c.series[i + 1];
      break;
    }
  }
  const span = hi.year - lo.year || 1;
  const t = (y - lo.year) / span;
  const birth = lerp(lo.birth, hi.birth, t);
  const death = lerp(lo.death, hi.death, t);
  const pop = lerp(lo.pop, hi.pop, t);
  return { year: y, birth, death, gap: birth - death, pop, trend: trendFromGap(birth - death) };
}

export function yearBounds(c: CountryData): [number, number] {
  return [c.series[0].year, c.series[c.series.length - 1].year];
}
