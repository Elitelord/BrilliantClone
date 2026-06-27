import { describe, expect, it } from 'vitest';
import {
  CONCEPTS,
  allConceptIds,
  conceptMasteryTarget,
  prereqsFor,
  weakestPrereq,
} from '../concepts';
import { MASTERY_THRESHOLD } from '../mastery';
import { getOrderedLessons } from './helpers';
import { gradableSteps } from '../mastery';
import type { MasteryRecord } from '../../types/progress';

const NOW = 1_700_000_000_000;

describe('concept catalog coverage', () => {
  it('has a catalog entry for every concept tag used by the active lessons', () => {
    const missing = new Set<string>();
    for (const lesson of getOrderedLessons()) {
      for (const step of gradableSteps(lesson)) {
        for (const tag of step.concepts ?? []) {
          if (!CONCEPTS[tag]) missing.add(`${lesson.id}:${tag}`);
        }
      }
    }
    expect([...missing]).toEqual([]);
  });

  it('every prerequisite references a real catalog concept', () => {
    const dangling: string[] = [];
    for (const id of allConceptIds()) {
      for (const p of prereqsFor(id)) {
        if (!CONCEPTS[p]) dangling.push(`${id} -> ${p}`);
      }
    }
    expect(dangling).toEqual([]);
  });
});

describe('prerequisite graph is acyclic', () => {
  it('contains no cycles', () => {
    const WHITE = 0;
    const GRAY = 1;
    const BLACK = 2;
    const color: Record<string, number> = {};
    const cycleFrom: string[] = [];

    function visit(id: string): boolean {
      color[id] = GRAY;
      for (const p of prereqsFor(id)) {
        if (color[p] === GRAY) {
          cycleFrom.push(`${id} -> ${p}`);
          return true;
        }
        if ((color[p] ?? WHITE) === WHITE && visit(p)) return true;
      }
      color[id] = BLACK;
      return false;
    }

    const hasCycle = allConceptIds().some((id) => (color[id] ?? WHITE) === WHITE && visit(id));
    expect(cycleFrom).toEqual([]);
    expect(hasCycle).toBe(false);
  });
});

describe('conceptMasteryTarget', () => {
  it('defaults to MASTERY_THRESHOLD/100', () => {
    expect(conceptMasteryTarget('natural-increase')).toBeCloseTo(MASTERY_THRESHOLD / 100, 5);
  });
});

describe('weakestPrereq', () => {
  function rec(id: string, p: Partial<MasteryRecord> = {}): MasteryRecord {
    return { conceptId: id, strength: 1, lastSeen: NOW, wrongCount: 0, ...p };
  }

  it('flags an unseen prerequisite as the weakest', () => {
    // dtm-stages requires natural-increase; with nothing learned, that prereq is weakest.
    expect(weakestPrereq('dtm-stages', {}, NOW)).toBe('natural-increase');
  });

  it('returns null when all prerequisites are solid', () => {
    const map = { 'natural-increase': rec('natural-increase') };
    expect(weakestPrereq('dtm-stages', map, NOW)).toBeNull();
  });

  it('returns null for a foundational concept with no prerequisites', () => {
    expect(weakestPrereq('natural-increase', {}, NOW)).toBeNull();
    expect(prereqsFor('natural-increase')).toEqual([]);
  });
});
