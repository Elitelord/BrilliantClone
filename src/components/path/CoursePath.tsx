import { useNavigate } from 'react-router-dom';

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

import LessonNode from './LessonNode';



export default function CoursePath() {

  const navigate = useNavigate();

  const data = useProgressStore((s) => s.data);

  const lessons = getOrderedLessons();

  const progressMap = data?.progress ?? {};



  const rec = recommendNext(lessons, progressMap);

  const recommendedId = rec && rec.kind !== 'done' ? rec.lessonId : '';



  return (

    <div className="flex flex-col gap-3">

      {lessons.map((lesson, i) => {

        const p = progressMap[lesson.id];

        const unlocked = isLessonUnlocked(lesson, progressMap);

        let status: 'locked' | 'available' | 'in_progress' | 'complete';

        if (isLessonComplete(p)) status = 'complete';

        else if (!unlocked) status = 'locked';

        else if (isLessonInProgress(p)) status = 'in_progress';

        else status = 'available';



        return (

          <LessonNode

            key={lesson.id}

            lesson={lesson}

            index={i}

            status={status}

            score={computeLessonScore(lesson, p)}

            mastered={isLessonMastered(lesson, p)}

            finishedOnce={!!p?.finishedOnce}

            reviewing={!!p?.finishedOnce && p.playState === 'in_progress'}

            recommended={lesson.id === recommendedId}

            onClick={() => navigate(`/lesson/${lesson.id}`)}

          />

        );

      })}

    </div>

  );

}

