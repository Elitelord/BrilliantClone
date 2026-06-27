import { describe, expect, it } from 'vitest';
import { scaffoldLevel, allowHint, targetDifficulty, FADED_AT, NONE_AT } from '../scaffold';

describe('scaffoldLevel', () => {
  it('gives full support to weak recall', () => {
    expect(scaffoldLevel(0)).toBe('full');
    expect(scaffoldLevel(FADED_AT - 0.01)).toBe('full');
  });

  it('fades support at medium recall', () => {
    expect(scaffoldLevel(FADED_AT)).toBe('faded');
    expect(scaffoldLevel(NONE_AT - 0.01)).toBe('faded');
  });

  it('withdraws support at strong recall', () => {
    expect(scaffoldLevel(NONE_AT)).toBe('none');
    expect(scaffoldLevel(1)).toBe('none');
  });
});

describe('allowHint', () => {
  it('offers a hint while weak or medium, but not when solid', () => {
    expect(allowHint(0.2)).toBe(true);
    expect(allowHint(0.6)).toBe(true);
    expect(allowHint(0.9)).toBe(false);
  });
});

describe('targetDifficulty', () => {
  it('rises with recall', () => {
    expect(targetDifficulty(0.1)).toBe(1);
    expect(targetDifficulty(0.6)).toBe(2);
    expect(targetDifficulty(0.95)).toBe(3);
  });
});
