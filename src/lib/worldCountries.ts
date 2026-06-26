// Real-country roster for the Lesson 6 world-map capstone.
// Rates are crude birth/death per 1,000; coords are [lng, lat] for map markers.
import { stageFromRates } from './dtm';

export interface MapCountry {
  id: string;
  name: string;
  flag: string;
  /** [longitude, latitude] for react-simple-maps Marker. */
  coords: [number, number];
  /** Canonical DTM stage for grading (1..5). */
  stage: number;
  birth: number;
  death: number;
  tfr: number;
  medianAge: number;
  /** Stage whose pyramid profile best matches this country (for mini-pyramid art). */
  pyramidStage: number;
  anomaly?: string;
  /** Birth/death timeline or totals diverge from textbook DTM expectations. */
  dtmDeviates?: boolean;
  blurb: string;
}

const MAP_COUNTRIES: MapCountry[] = [
  {
    id: 'niger',
    name: 'Niger',
    flag: '🇳🇪',
    coords: [8.08, 17.61],
    stage: 2,
    birth: 42,
    death: 10,
    tfr: 6.7,
    medianAge: 15,
    pyramidStage: 2,
    dtmDeviates: true,
    blurb: 'One of the highest birth rates on Earth — deaths have fallen but births stay sky-high.',
  },
  {
    id: 'afghanistan',
    name: 'Afghanistan',
    flag: '🇦🇫',
    coords: [67.71, 33.94],
    stage: 2,
    birth: 36,
    death: 12,
    tfr: 4.5,
    medianAge: 19,
    pyramidStage: 2,
    blurb: 'Wide youth base, high natural increase — classic early expanding stage.',
  },
  {
    id: 'nigeria',
    name: 'Nigeria',
    flag: '🇳🇬',
    coords: [8.68, 9.08],
    stage: 2,
    birth: 37,
    death: 12,
    tfr: 5.1,
    medianAge: 18,
    pyramidStage: 2,
    blurb: 'Africa\'s most populous country — still in rapid growth with a broad pyramid base.',
  },
  {
    id: 'ethiopia',
    name: 'Ethiopia',
    flag: '🇪🇹',
    coords: [40.49, 9.15],
    stage: 2,
    birth: 31,
    death: 6,
    tfr: 4.1,
    medianAge: 20,
    pyramidStage: 2,
    blurb: 'Deaths have plunged but births stay high — a prolonged Stage 2 youth bulge.',
  },
  {
    id: 'bangladesh',
    name: 'Bangladesh',
    flag: '🇧🇩',
    coords: [90.36, 23.68],
    stage: 2,
    birth: 18,
    death: 5,
    tfr: 2.0,
    medianAge: 28,
    pyramidStage: 2,
    dtmDeviates: true,
    blurb: 'Still a wide base and strong natural increase — early expanding, though births are falling.',
  },
  {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    coords: [78.96, 20.59],
    stage: 3,
    birth: 17,
    death: 7,
    tfr: 2.0,
    medianAge: 28,
    pyramidStage: 3,
    blurb: 'Births falling fast — the pyramid is narrowing as the country matures.',
  },
  {
    id: 'brazil',
    name: 'Brazil',
    flag: '🇧🇷',
    coords: [-51.93, -14.24],
    stage: 3,
    birth: 14,
    death: 7,
    tfr: 1.6,
    medianAge: 34,
    pyramidStage: 3,
    blurb: 'Late expanding — births have dropped well below Stage 2 levels.',
  },
  {
    id: 'mexico',
    name: 'Mexico',
    flag: '🇲🇽',
    coords: [-102.55, 23.63],
    stage: 3,
    birth: 17,
    death: 6,
    tfr: 1.9,
    medianAge: 30,
    pyramidStage: 3,
    blurb: 'Transition well underway — growth slowing as families shrink.',
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    flag: '🇮🇩',
    coords: [113.92, -0.79],
    stage: 3,
    birth: 16,
    death: 7,
    tfr: 2.2,
    medianAge: 30,
    pyramidStage: 3,
    blurb: 'A narrowing pyramid — births falling as the country industrializes.',
  },
  {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    coords: [-95.71, 37.09],
    stage: 4,
    birth: 11,
    death: 9,
    tfr: 1.6,
    medianAge: 39,
    pyramidStage: 4,
    blurb: 'Low births, low deaths — near replacement, with a fairly even age structure.',
  },
  {
    id: 'uae',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    coords: [53.85, 23.42],
    stage: 4,
    birth: 9,
    death: 2,
    tfr: 1.4,
    medianAge: 34,
    pyramidStage: 4,
    anomaly: 'guestWorker',
    dtmDeviates: true,
    blurb: 'Moderate birth rates but population exploded through foreign labor migration.',
  },
  {
    id: 'china',
    name: 'China',
    flag: '🇨🇳',
    coords: [104.2, 35.86],
    stage: 4,
    birth: 7,
    death: 8,
    tfr: 1.2,
    medianAge: 39,
    pyramidStage: 5,
    anomaly: 'oneChild',
    dtmDeviates: true,
    blurb: 'Decades of one-child policy carved a narrow base and heavy elderly dependency.',
  },
  {
    id: 'france',
    name: 'France',
    flag: '🇫🇷',
    coords: [2.21, 46.23],
    stage: 4,
    birth: 11,
    death: 10,
    tfr: 1.8,
    medianAge: 42,
    pyramidStage: 4,
    blurb: 'Low births, low deaths — a fairly even column pyramid near replacement.',
  },
  {
    id: 'germany',
    name: 'Germany',
    flag: '🇩🇪',
    coords: [10.45, 51.17],
    stage: 5,
    birth: 9,
    death: 12,
    tfr: 1.5,
    medianAge: 46,
    pyramidStage: 5,
    blurb: 'Deaths exceed births — an aging, top-heavy pyramid with slow population decline.',
  },
  {
    id: 'japan',
    name: 'Japan',
    flag: '🇯🇵',
    coords: [138.25, 36.2],
    stage: 5,
    birth: 6,
    death: 13,
    tfr: 1.3,
    medianAge: 49,
    pyramidStage: 5,
    blurb: 'The textbook Stage 5 case — shrinking population and the world\'s oldest median age.',
  },
  {
    id: 'south-korea',
    name: 'South Korea',
    flag: '🇰🇷',
    coords: [127.77, 35.91],
    stage: 5,
    birth: 5,
    death: 8,
    tfr: 0.7,
    medianAge: 45,
    pyramidStage: 5,
    dtmDeviates: true,
    blurb: 'World\'s lowest fertility — births fell below deaths in a compressed transition.',
  },
  {
    id: 'italy',
    name: 'Italy',
    flag: '🇮🇹',
    coords: [12.57, 41.87],
    stage: 5,
    birth: 7,
    death: 12,
    tfr: 1.2,
    medianAge: 48,
    pyramidStage: 5,
    blurb: 'One of Europe\'s oldest populations — deaths well above births, pyramid top-heavy.',
  },
];

/** Default roster for the capstone lesson map. */
export const CAPSTONE_COUNTRY_IDS = MAP_COUNTRIES.map((c) => c.id);

export const MAP_COUNTRIES_BY_ID: Record<string, MapCountry> = Object.fromEntries(
  MAP_COUNTRIES.map((c) => [c.id, c]),
);

export function getMapCountry(id: string): MapCountry | undefined {
  return MAP_COUNTRIES_BY_ID[id];
}

export function getMapCountries(ids: string[]): MapCountry[] {
  return ids.map((id) => getMapCountry(id)).filter((c): c is MapCountry => Boolean(c));
}

/** All capstone roster countries at a given DTM stage. */
export function capstoneIdsByStage(stage: number): string[] {
  return MAP_COUNTRIES.filter((c) => c.stage === stage).map((c) => c.id);
}

/** True when the pyramid shape diverges from what this country's DTM stage would predict. */
export function pyramidDeviatesFromStage(c: MapCountry): boolean {
  return c.anomaly != null || c.stage !== c.pyramidStage;
}

/** Countries where DTM path/rates OR pyramid shape clearly diverges from textbook expectations. */
export function capstoneIdsWithDeviation(): string[] {
  return MAP_COUNTRIES.filter((c) => c.dtmDeviates || pyramidDeviatesFromStage(c)).map((c) => c.id);
}

/** Recompute stage from rates (sanity check / tests). */
export function impliedMapStage(c: MapCountry): number {
  return stageFromRates(c.birth, c.death);
}
