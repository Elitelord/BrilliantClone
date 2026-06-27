import { describe, expect, it } from 'vitest';
import { REVIEW_BANK } from '../../content/reviewBank';
import { verifySkillCheckQuestion } from '../ai/verify';
import { CONCEPTS } from '../concepts';

describe('review bank', () => {
  it('every item verifies against dtm.ts AND matches its claimed answer', () => {
    const failures: string[] = [];
    REVIEW_BANK.forEach((item, i) => {
      const v = verifySkillCheckQuestion(item);
      if (!v) {
        failures.push(`#${i} (${item.template}) did not verify`);
        return;
      }
      if (v.correctId !== item.claimedCorrectId) {
        failures.push(
          `#${i} (${item.template}) claims ${item.claimedCorrectId} but dtm.ts computes ${v.correctId}`,
        );
      }
    });
    expect(failures).toEqual([]);
  });

  it('every item has exactly 4 options with ids a–d', () => {
    for (const item of REVIEW_BANK) {
      expect(item.options.map((o) => o.id)).toEqual(['a', 'b', 'c', 'd']);
    }
  });

  it('every concept tag exists in the catalog', () => {
    const bad: string[] = [];
    for (const item of REVIEW_BANK) {
      for (const c of item.concepts) if (!CONCEPTS[c]) bad.push(`${item.template}:${c}`);
    }
    expect(bad).toEqual([]);
  });

  it('covers the core verifiable concepts', () => {
    const covered = new Set(REVIEW_BANK.flatMap((i) => i.concepts));
    for (const c of [
      'natural-increase',
      'dtm-stages',
      'pyramid-shape',
      'cause-of-death',
      'fertility-transition',
      'density',
      'malthus',
      'dependency-ratio',
      'migration',
    ]) {
      expect(covered.has(c)).toBe(true);
    }
  });
});
