import type { Course, Lesson } from '../types/content';
import { dtmEngine } from './lessons/dtmEngine';
import { populationPyramids } from './lessons/populationPyramids';
import { sectorShift } from './lessons/sectorShift';

export const dtmCourse: Course = {
  id: 'dtm',
  title: 'The Demographic Transition Model',
  subject: 'AP Human Geography',
  description:
    'Learn how and why populations grow, stabilize, and shrink as countries develop - by doing, not memorizing.',
  lessonIds: ['dtm-engine', 'population-pyramids', 'sector-shift'],
};

const LESSONS: Record<string, Lesson> = {
  [dtmEngine.id]: dtmEngine,
  [populationPyramids.id]: populationPyramids,
  [sectorShift.id]: sectorShift,
};

export function getLesson(id: string): Lesson | undefined {
  return LESSONS[id];
}

// Lessons in course order.
export function getOrderedLessons(): Lesson[] {
  return dtmCourse.lessonIds
    .map((id) => LESSONS[id])
    .filter((l): l is Lesson => Boolean(l));
}

export function getCourse(): Course {
  return dtmCourse;
}
