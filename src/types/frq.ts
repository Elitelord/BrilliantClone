// Free-response (FRQ) practice — typed data, like lessons. An FRQ is a stimulus plus a
// few lettered parts (A, B, C…), each a task-verb prompt graded for one point. Most
// parts are graded by the existing explain-back rubric grader; "identify" parts that
// map to subject logic are graded deterministically from dtm.ts (see lib/frqGrading.ts).
import type { ExplainBackConfig, Interaction } from './content';

export type FrqTaskVerb = 'identify' | 'define' | 'describe' | 'explain' | 'compare';

/**
 * Deterministic check for an Identify part: the canonical answer is computed from the
 * stimulus via dtm.ts, then matched (tolerantly) against the learner's text — no AI.
 */
export type FrqAutoCheck =
  | { kind: 'stage'; controls: [number, number, number, number] } // pyramid shape → stage
  | { kind: 'stage-rates'; cbr: number; cdr: number } // rates → stage
  | { kind: 'trend'; cbr: number; cdr: number } // rates → population trend
  | { kind: 'sector'; primary: number; secondary: number; tertiary: number };

export interface FrqPart {
  id: string;
  label: string; // 'A', 'B', 'C'
  taskVerb: FrqTaskVerb;
  prompt: string;
  /** Criteria that earn the point (also shown to the learner on reveal). */
  rubric: string[];
  sampleAnswer: string;
  concepts: string[];
  minChars?: number;
  /** Present on deterministic Identify parts (graded without AI). */
  autoCheck?: FrqAutoCheck;
}

/**
 * A read-only data table stimulus (vital stats, sector mix, resource figures). Kept
 * FRQ-local rather than a global Interaction, since it's display-only (no answer/
 * validation plumbing). Discriminated from an Interaction by its `kind` field.
 */
export interface FrqTableStimulus {
  kind: 'table';
  caption?: string;
  columns: string[];
  rows: (string | number)[][];
}

/** A stimulus is either a (read-only) interaction or a data table. */
export type FrqStimulus = Interaction | FrqTableStimulus;

export interface Frq {
  id: string;
  title: string;
  intro?: string;
  /** Read-only stimuli shown above every part — 0 (concept FRQ), 1, or 2 (comparison). */
  stimuli?: FrqStimulus[];
  /** Plain-language description of the stimulus/stimuli — grounds the AI grade of open parts. */
  stimulusSummary: string;
  parts: FrqPart[];
  cedTopics: string[];
}

/**
 * Adapt an FRQ part to the explain-back config so `ExplainBack` (input + model-answer
 * reveal) and `gradeExplanation` (rubric grading) can be reused unchanged.
 */
export function partToExplainConfig(part: FrqPart): ExplainBackConfig {
  return {
    question: part.prompt,
    rubric: part.rubric,
    sampleAnswer: part.sampleAnswer,
    minChars: part.minChars,
  };
}
