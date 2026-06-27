import { describe, expect, it } from 'vitest';
import { generateReviewItems, attributeReviewConcept } from '../ai/features/reviewItems';

describe('generateReviewItems', () => {
  // Returns before any AI call when no concept is in the catalog — the one branch we
  // can assert deterministically. (The AI-off → null fallback runs through generateJson,
  // which is environment-dependent and would hit the network, so it is not unit-tested
  // here; the generate layer's AI-off gate is covered separately.)
  it('returns null when no concepts are known to the catalog', async () => {
    expect(await generateReviewItems(['totally-unknown-concept'], {})).toBeNull();
  });
});

describe('attributeReviewConcept', () => {
  it('maps a template to its concept when that concept is due', () => {
    expect(attributeReviewConcept('density-measure', ['density', 'malthus'])).toBe('density');
    expect(attributeReviewConcept('net-migration', ['migration'])).toBe('migration');
  });

  it('falls back to the first due concept for qualitative or off-set templates', () => {
    expect(attributeReviewConcept('qualitative', ['migration', 'density'])).toBe('migration');
    // mapped concept (density) not in the due set -> fall back to first due
    expect(attributeReviewConcept('density-measure', ['migration'])).toBe('migration');
  });
});
