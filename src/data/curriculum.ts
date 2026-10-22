import { GradeLevel, TopicItem } from '../types/math';
import { CURRICULUM_GRADE_5 } from './curriculumGrade5';
import { CURRICULUM_GRADE_6 } from './curriculumGrade6';
import { CURRICULUM_GRADE_7 } from './curriculumGrade7';
import { CURRICULUM_GRADE_8 } from './curriculumGrade8';
import { CURRICULUM_GRADE_9 } from './curriculumGrade9';

export const CURRICULUM_DATA: Record<GradeLevel, TopicItem[]> = {
  5: CURRICULUM_GRADE_5,
  6: CURRICULUM_GRADE_6,
  7: CURRICULUM_GRADE_7,
  8: CURRICULUM_GRADE_8,
  9: CURRICULUM_GRADE_9,
};

// Summary stats across grades 5-9
export const CURRICULUM_STATS = {
  totalGrades: 5,
  totalSections:
    CURRICULUM_GRADE_5.length +
    CURRICULUM_GRADE_6.length +
    CURRICULUM_GRADE_7.length +
    CURRICULUM_GRADE_8.length +
    CURRICULUM_GRADE_9.length,
  quartersPerGrade: 4,
};
