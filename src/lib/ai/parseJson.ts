/** Strip markdown fences and leading prose so model JSON parses reliably. */
export function parseAiJson(text: string): unknown {
  let t = text.trim();
  const fenced = t.match(/^```(?:json)?\s*([\s\S]*?)```$/);
  if (fenced) t = fenced[1].trim();

  const objStart = t.indexOf('{');
  const arrStart = t.indexOf('[');
  const start =
    objStart >= 0 && (arrStart < 0 || objStart < arrStart) ? objStart : arrStart;
  if (start > 0) t = t.slice(start);

  const end = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
  if (end >= 0 && end < t.length - 1) t = t.slice(0, end + 1);

  return JSON.parse(t);
}

/** Coerce common alternate key names from OpenAI json_object responses. */
export function normalizeHintResponse(
  raw: unknown,
): { hint: string; givesAwayAnswer: boolean } | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const hint = [o.hint, o.nudge, o.feedback, o.message, o.explanation].find(
    (v) => typeof v === 'string' && v.trim(),
  ) as string | undefined;
  if (!hint?.trim()) return null;
  const givesAwayAnswer = Boolean(
    o.givesAwayAnswer ?? o.gives_away_answer ?? o.leaksAnswer ?? false,
  );
  return { hint: hint.trim(), givesAwayAnswer };
}
