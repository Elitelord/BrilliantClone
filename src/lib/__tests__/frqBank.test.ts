import { describe, expect, it } from 'vitest';
import { FRQ_BANK, getFrq } from '../../content/frqBank';
import { gradeAutoCheck } from '../frqGrading';
import { CONCEPTS } from '../concepts';

describe('FRQ bank', () => {
  it('getFrq returns the first FRQ by default and resolves by id', () => {
    expect(getFrq()).toBe(FRQ_BANK[0]);
    expect(getFrq(FRQ_BANK[0].id)).toBe(FRQ_BANK[0]);
    expect(getFrq('does-not-exist')).toBeUndefined();
  });

  it('every part is well-formed and tagged with catalog concepts', () => {
    const bad: string[] = [];
    for (const frq of FRQ_BANK) {
      const seen = new Set<string>();
      for (const part of frq.parts) {
        if (seen.has(part.id)) bad.push(`${frq.id}: duplicate part id ${part.id}`);
        seen.add(part.id);
        if (!part.prompt.trim()) bad.push(`${frq.id}.${part.id}: empty prompt`);
        if (part.rubric.length === 0 || part.rubric.some((r) => !r.trim()))
          bad.push(`${frq.id}.${part.id}: empty rubric`);
        if (!part.sampleAnswer.trim()) bad.push(`${frq.id}.${part.id}: empty sampleAnswer`);
        for (const c of part.concepts) if (!CONCEPTS[c]) bad.push(`${frq.id}.${part.id}: unknown concept ${c}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("every identify part's model answer passes its own deterministic auto-check", () => {
    const fails: string[] = [];
    for (const frq of FRQ_BANK) {
      for (const part of frq.parts) {
        if (!part.autoCheck) continue;
        if (part.taskVerb !== 'identify') fails.push(`${frq.id}.${part.id}: autoCheck on a non-identify part`);
        if (!gradeAutoCheck(part.autoCheck, part.sampleAnswer).earned)
          fails.push(`${frq.id}.${part.id}: sampleAnswer "${part.sampleAnswer}" fails its own auto-check`);
      }
    }
    expect(fails).toEqual([]);
  });

  it('has 3 FRQs of 6 parts each, spanning 0 / 1 / 2 stimuli', () => {
    expect(FRQ_BANK.length).toBe(3);
    for (const frq of FRQ_BANK) expect(frq.parts.length).toBe(6);
    expect(FRQ_BANK.map((f) => f.stimuli?.length ?? 0)).toEqual([0, 1, 2]);
  });

  it('table stimuli are well-formed (every row matches the column count)', () => {
    const bad: string[] = [];
    for (const frq of FRQ_BANK) {
      for (const s of frq.stimuli ?? []) {
        if ('kind' in s && s.kind === 'table') {
          s.rows.forEach((row, i) => {
            if (row.length !== s.columns.length)
              bad.push(`${frq.id}: table row ${i} has ${row.length} cells, expected ${s.columns.length}`);
          });
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
