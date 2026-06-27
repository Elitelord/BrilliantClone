import type { Course, Lesson } from '../types/content';
import { dtmEngine } from './lessons/dtmEngine';
import { populationPyramids } from './lessons/populationPyramids';
import { epiTransition } from './lessons/epiTransition';
import { limitsOfGrowth } from './lessons/limitsOfGrowth';
import { populationStructure } from './lessons/populationStructure';
import { whyPeopleMove } from './lessons/whyPeopleMove';
import { placeCountry } from './lessons/placeCountry';

export const dtmCourse: Course = {
  id: 'dtm',
  title: 'The Demographic Transition Model',
  subject: 'AP Human Geography',
  description:
    'Learn how and why populations grow, stabilize, and shrink as countries develop - by doing, not memorizing.',
  lessonIds: [
    'dtm-engine',
    'population-pyramids',
    'epi-transition',
    'limits-of-growth',
    'population-structure',
    'why-people-move',
    'place-country',
  ],
};

const LESSONS: Record<string, Lesson> = {
  [dtmEngine.id]: dtmEngine,
  [populationPyramids.id]: populationPyramids,
  [epiTransition.id]: epiTransition,
  [limitsOfGrowth.id]: limitsOfGrowth,
  [populationStructure.id]: populationStructure,
  [whyPeopleMove.id]: whyPeopleMove,
  [placeCountry.id]: placeCountry,
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
