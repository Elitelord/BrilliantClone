import { describe, expect, it } from 'vitest';
import { canonicalAnswer, gradeAutoCheck } from '../frqGrading';
import type { FrqAutoCheck } from '../../types/frq';

const STAGE2: FrqAutoCheck = { kind: 'stage', controls: [0.92, 0.76, 0.4, 0.2] };

describe('canonicalAnswer', () => {
  it('computes the stage from pyramid controls', () => {
    expect(canonicalAnswer(STAGE2)).toMatch(/Stage 2/);
  });

  it('computes stage from rates, trend, and sector', () => {
    expect(canonicalAnswer({ kind: 'stage-rates', cbr: 38, cdr: 12 })).toMatch(/Stage 2/);
    expect(canonicalAnswer({ kind: 'trend', cbr: 34, cdr: 11 })).toBe('Rapid growth');
    expect(canonicalAnswer({ kind: 'sector', primary: 70, secondary: 18, tertiary: 12 })).toMatch(/primary/i);
  });
});

describe('gradeAutoCheck (stage)', () => {
  it('earns the point for the right stage — digit, "stage N", or stage name', () => {
    expect(gradeAutoCheck(STAGE2, 'Stage 2').earned).toBe(true);
    expect(gradeAutoCheck(STAGE2, 'stage 2 — early expanding').earned).toBe(true);
    expect(gradeAutoCheck(STAGE2, 'Early Expanding').earned).toBe(true);
    expect(gradeAutoCheck(STAGE2, '2').earned).toBe(true);
  });

  it('rejects the wrong stage, hedged answers, and too-short answers', () => {
    expect(gradeAutoCheck(STAGE2, 'Stage 4').earned).toBe(false);
    expect(gradeAutoCheck(STAGE2, 'stage 2 or stage 3').earned).toBe(false);
    expect(gradeAutoCheck(STAGE2, '').earned).toBe(false);
    expect(gradeAutoCheck(STAGE2, 'x').earned).toBe(false);
  });

  it('always returns the canonical answer for the reveal', () => {
    expect(gradeAutoCheck(STAGE2, 'totally wrong').canonical).toMatch(/Stage 2/);
  });
});

describe('gradeAutoCheck (trend)', () => {
  it('matches the correct trend by keyword and rejects the wrong one', () => {
    const shrinking: FrqAutoCheck = { kind: 'trend', cbr: 9, cdr: 11 };
    expect(gradeAutoCheck(shrinking, 'shrinking').earned).toBe(true);
    expect(gradeAutoCheck(shrinking, 'the population is declining').earned).toBe(true);
    expect(gradeAutoCheck(shrinking, 'growing').earned).toBe(false);

    const growing: FrqAutoCheck = { kind: 'trend', cbr: 25, cdr: 10 };
    expect(gradeAutoCheck(growing, 'it is still growing').earned).toBe(true);
    expect(gradeAutoCheck(growing, 'shrinking').earned).toBe(false);
  });
});
