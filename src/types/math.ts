export type GradeLevel = 5 | 6 | 7 | 8 | 9;

export type TaskLevel = 'A' | 'B' | 'C';

export type QuarterType = 1 | 2 | 3 | 4;

export type SubjectType = 'Математика' | 'Алгебра' | 'Геометрия';

export interface VisualData {
  type: 'fraction' | 'triangle' | 'quadrilateral' | 'parabola' | 'linear_graph' | 'number_line' | 'angle' | 'circle';
  title?: string;
  fractionNumerator?: number;
  fractionDenominator?: number;
  a?: number;
  b?: number;
  c?: number;
  points?: { x: number; y: number; label: string }[];
  sideA?: number;
  sideB?: number;
  sideC?: number;
  angleA?: number;
  angleB?: number;
  angleC?: number;
  intervalStart?: number;
  intervalEnd?: number;
  includeLeft?: boolean;
  includeRight?: boolean;
}

export interface MathTask {
  id: string;
  grade: GradeLevel;
  subject: SubjectType;
  quarter: QuarterType;
  sectionCode?: string; // e.g. "5.1А", "7.1В", "9.2А"
  topicId: string;
  topicTitle: string;
  level: TaskLevel;
  levelLabel: string;
  learningObjective: string;
  question: string;
  options: string[];
  correctAnswer: string;
  hint1: string;
  hint2: string;
  solutionSteps: string[];
  descriptor: string;
  points: number;
  visualData?: VisualData;
}

export interface TopicItem {
  id: string;
  grade: GradeLevel;
  subject: SubjectType;
  quarter: QuarterType;
  sectionCode: string;
  title: string;
  description: string;
  hours?: number;
  learningObjectives: string[];
  sampleTasks: MathTask[];
}

export interface TaskSet {
  id: string;
  title: string;
  grade: GradeLevel;
  subject: SubjectType;
  quarter: QuarterType;
  topic: string;
  sectionCode?: string;
  taskType: 'БЖБ' | 'ТЖБ' | 'Практикалық' | 'Олимпиадалық';
  learningObjective: string;
  assessmentCriteria: string[];
  tasks: MathTask[];
  totalPoints: number;
  createdAt: string;
  code: string;
}

export interface AdaptiveProfile {
  studentName: string;
  currentGrade: GradeLevel;
  currentLevel: TaskLevel;
  levelScore: number;
  streak: number;
  totalSolved: number;
  totalCorrect: number;
  xp: number;
  history: {
    taskId: string;
    level: TaskLevel;
    correct: boolean;
    attempts: number;
    usedHint: boolean;
    timestamp: number;
  }[];
  masteryByTopic: Record<string, { A: number; B: number; C: number }>;
}
