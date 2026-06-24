import { Navigate, useParams } from 'react-router-dom';
import { getLesson } from '../content';
import { isLessonUnlocked } from '../lib/mastery';
import { useProgressStore } from '../store/progressStore';
import LessonRunner from '../components/lesson/LessonRunner';

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const progressMap = useProgressStore((s) => s.data?.progress ?? {});
  const lesson = lessonId ? getLesson(lessonId) : undefined;

  if (!lesson) return <Navigate to="/" replace />;
  if (!isLessonUnlocked(lesson, progressMap)) {
    return <Navigate to="/" replace state={{ lockedLesson: lesson.title }} />;
  }

  // key on lesson id so the runner fully resets when switching lessons
  return <LessonRunner key={lesson.id} lesson={lesson} />;
}
