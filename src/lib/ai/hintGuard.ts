import type { Step, Trend } from '../../types/content';
import { TREND_LABEL } from '../dtm';

/** Authored hint safe to show — rejects hints that leak the answer. */
export function safeAuthoredHint(step: Step): string | null {
  const hint = step.feedback.hint?.trim();
  if (!hint || hintLeaksAnswer(hint, step)) return null;
  return hint;
}

/** pre-answer: block anything that reveals the solution. post-wrong: allow critiquing wrong attempts. */
export type HintGuardMode = 'pre-answer' | 'post-wrong';

/** Deterministic guard: reject hints that leak the correct answer. */
export function hintLeaksAnswer(
  hint: string,
  step: Step,
  mode: HintGuardMode = 'pre-answer',
): boolean {
  const text = hint.toLowerCase();
  const answer = step.answer;
  if (!answer) return false;

  const { interaction } = step;

  // Always block near-copies of authored solution / correct feedback text.
  const authored = step.feedback.hint?.trim().toLowerCase();
  if (authored && authored.length >= 12 && text !== authored && text.includes(authored)) return true;
  const correctFb = step.feedback.correct?.trim().toLowerCase();
  if (correctFb && correctFb.length >= 20 && text.includes(correctFb.slice(0, 40))) return true;

  // Post-wrong nudges should explain mistakes — allow stage numbers, trends, etc.
  if (mode === 'post-wrong') return false;

  if ('correctId' in answer && answer.correctId && interaction.type === 'multiple-choice') {
    const opt = interaction.config.options.find((o) => o.id === answer.correctId);
    if (opt && text.includes(opt.label.toLowerCase())) return true;
  }

  if ('stages' in answer && answer.stages?.length) {
    for (const st of answer.stages) {
      if (text.includes(`stage ${st}`) || text.includes(`stage${st}`)) return true;
      if (new RegExp(`\\b${st}\\b`).test(text) && text.includes('stage')) return true;
    }
  }

  if ('trend' in answer && answer.trend) {
    const trend = answer.trend as Trend;
    if (text.includes(trend) || text.includes(TREND_LABEL[trend].toLowerCase())) return true;
  }

  if ('minGap' in answer && typeof answer.minGap === 'number') {
    if (/\b(wide|large|big)\s+(positive\s+)?(nir|gap)\b/.test(text)) return true;
    if (/\bpositive\s+(nir|gap|natural increase)\b/.test(text)) return true;
    if (/\b(births?\b.*\b(outpace|exceed|surpass|far)\b.*\bdeath)/.test(text)) return true;
  }

  if ('dominant' in answer && answer.dominant) {
    if (text.includes(answer.dominant)) return true;
  }

  if (interaction.type === 'rate-graph' || interaction.type === 'rate-sliders') {
    if ('stages' in answer && answer.stages?.length) {
      for (const st of answer.stages) {
        if (text.includes(`stage ${st}`)) return true;
      }
    }
  }

  if (interaction.type === 'nir-slider' || interaction.type === 'rate-sliders') {
    if (/\b(set|drag|move|slide|widen|increase)\b/.test(text) && /\b(gap|nir)\b/.test(text)) {
      return true;
    }
  }

  if (interaction.type === 'match-pairs') {
    const tilePairs: Array<[string, string]> = [];
    if ('pairs' in answer && answer.pairs) {
      for (const [tileId, slotId] of Object.entries(answer.pairs)) tilePairs.push([tileId, slotId]);
    }
    if ('tileSlots' in answer && answer.tileSlots) {
      for (const [tileId, slotIds] of Object.entries(answer.tileSlots)) {
        for (const slotId of slotIds) tilePairs.push([tileId, slotId]);
      }
    }
    for (const [tileId, slotId] of tilePairs) {
      const tile = interaction.config.tiles.find((t) => t.id === tileId);
      const slot = interaction.config.slots.find((s) => s.id === slotId);
      if (tile && slot && text.includes(tile.label.toLowerCase()) && text.includes(slot.label.toLowerCase())) {
        return true;
      }
    }
  }

  if ('birth' in answer && interaction.type === 'curve-draw') {
    if (/\bstage [1-5]\b/.test(text)) return true;
  }

  return false;
}
