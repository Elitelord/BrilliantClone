import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { line, curveNatural } from 'd3-shape';

import { getOrderedLessons } from '../../content';
import { useProgressStore } from '../../store/progressStore';
import {
  isLessonComplete,
  isLessonInProgress,
  isLessonUnlocked,
  isLessonMastered,
  computeLessonScore,
  recommendNext,
} from '../../lib/mastery';
import LessonNode, { type NodeStatus } from './LessonNode';

const ROW_HEIGHT = 144;
const TOP_PAD = 124;
const BOTTOM_PAD = 140;
const SWING_FREQ = 0.9;

export default function CoursePath() {
  const navigate = useNavigate();
  const data = useProgressStore((s) => s.data);
  const lessons = getOrderedLessons();
  const progressMap = data?.progress ?? {};

  const rec = recommendNext(lessons, progressMap);
  const recommendedId = rec && rec.kind !== 'done' ? rec.lessonId : '';

  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // pointer drag-to-pan + suppress click after a drag
  const drag = useRef({ active: false, startY: 0, startTop: 0, moved: false });
  // stop auto-centering once the learner takes control of the scroll
  const userTook = useRef(false);
  const centered = useRef(false);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nodes = useMemo(() => {
    const amp = width ? Math.min(width * 0.3, 150) : 0;
    const cx = width / 2;
    return lessons.map((lesson, i) => {
      const p = progressMap[lesson.id];
      const unlocked = isLessonUnlocked(lesson, progressMap);
      let status: NodeStatus;
      if (isLessonComplete(p)) status = 'complete';
      else if (!unlocked) status = 'locked';
      else if (isLessonInProgress(p)) status = 'in_progress';
      else status = 'available';

      return {
        lesson,
        index: i,
        status,
        x: cx + Math.sin(i * SWING_FREQ) * amp,
        y: TOP_PAD + i * ROW_HEIGHT,
        score: computeLessonScore(lesson, p),
        mastered: isLessonMastered(lesson, p),
        finishedOnce: !!p?.finishedOnce,
        reviewing: !!p?.finishedOnce && p.playState === 'in_progress',
        recommended: lesson.id === recommendedId,
      };
    });
  }, [lessons, progressMap, width, recommendedId]);

  const canvasHeight = TOP_PAD + (lessons.length - 1) * ROW_HEIGHT + BOTTOM_PAD;
  const currentIndex = Math.max(0, nodes.findIndex((n) => n.recommended));

  const { bgPath, progressPath } = useMemo(() => {
    if (!width || nodes.length < 2) return { bgPath: '', progressPath: '' };
    const gen = line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(curveNatural);
    const pts = nodes.map((n) => [n.x, n.y] as [number, number]);
    const solidCount = recommendedId ? currentIndex + 1 : pts.length;
    return {
      bgPath: gen(pts) ?? '',
      progressPath: gen(pts.slice(0, Math.max(2, solidCount))) ?? '',
    };
  }, [nodes, width, currentIndex, recommendedId]);

  // Auto-center ("zoom to") the current lesson once on load.
  useEffect(() => {
    const sc = scrollRef.current;
    const target = nodes[currentIndex];
    if (!sc || !width || !target || centered.current || userTook.current) return;
    centered.current = true;
    sc.scrollTo({ top: Math.max(0, target.y - sc.clientHeight / 2), behavior: 'smooth' });
  }, [width, currentIndex, nodes]);

  const markUserTook = () => {
    userTook.current = true;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const sc = scrollRef.current;
    if (!sc) return;
    drag.current = { active: true, startY: e.clientY, startTop: sc.scrollTop, moved: false };
    markUserTook();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const sc = scrollRef.current;
    if (!sc || !drag.current.active) return;
    const dy = e.clientY - drag.current.startY;
    if (Math.abs(dy) > 4) drag.current.moved = true;
    sc.scrollTop = drag.current.startTop - dy;
  };
  const endDrag = () => {
    drag.current.active = false;
  };

  const handleSelect = (lessonId: string, locked: boolean) => {
    if (locked || drag.current.moved) return;
    navigate(`/lesson/${lessonId}`);
  };

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onWheel={markUserTook}
      className="relative h-[64vh] min-h-[440px] select-none overflow-y-auto overflow-x-hidden rounded-3xl border border-slate-100 bg-gradient-to-b from-brand-50/40 via-white to-white [scrollbar-width:none] cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'pan-y' }}
    >
      <div ref={canvasRef} className="relative w-full" style={{ height: canvasHeight }}>
        {width > 0 && (
          <svg
            className="pointer-events-none absolute inset-0"
            width={width}
            height={canvasHeight}
            aria-hidden
          >
            <path
              d={bgPath}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray="0.1 16"
            />
            <path
              d={progressPath}
              fill="none"
              stroke="#a5b4fc"
              strokeWidth={6}
              strokeLinecap="round"
            />
          </svg>
        )}

        {width > 0 &&
          nodes.map((n) => (
            <LessonNode
              key={n.lesson.id}
              lesson={n.lesson}
              index={n.index}
              status={n.status}
              score={n.score}
              mastered={n.mastered}
              finishedOnce={n.finishedOnce}
              reviewing={n.reviewing}
              recommended={n.recommended}
              x={n.x}
              y={n.y}
              canvasWidth={width}
              onSelect={() => handleSelect(n.lesson.id, n.status === 'locked')}
            />
          ))}
      </div>
    </div>
  );
}
