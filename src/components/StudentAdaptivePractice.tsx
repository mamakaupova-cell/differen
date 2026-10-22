import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GradeLevel, TaskLevel, MathTask, TaskSet, AdaptiveProfile, QuarterType, SubjectType } from '../types/math';
import { CURRICULUM_DATA } from '../data/curriculum';
import { generateProceduralTask } from '../utils/dynamicTaskGenerator';
import { MathVisualizer } from './MathVisualizer';
import { Scratchpad } from './Scratchpad';
import { DiagnosticTestModal } from './DiagnosticTestModal';
import { sound } from '../utils/sound';
import {
  BrainCircuit,
  Flame,
  Award,
  PenTool,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Volume2,
  VolumeX,
  Pause,
  FastForward,
  RotateCw,
  Zap,
} from 'lucide-react';

interface StudentAdaptivePracticeProps {
  customTaskSet?: TaskSet | null;
  onClearCustomSet?: () => void;
}

export const StudentAdaptivePractice: React.FC<StudentAdaptivePracticeProps> = ({
  customTaskSet,
  onClearCustomSet,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(
    customTaskSet ? customTaskSet.grade : 7
  );
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterType | 'ALL'>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'ALL'>('ALL');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    customTaskSet ? customTaskSet.tasks[0]?.topicId || '7-1A-powers' : '7-1A-powers'
  );

  const [profile, setProfile] = useState<AdaptiveProfile>({
    studentName: 'Оқушы',
    currentGrade: selectedGrade,
    currentLevel: 'A',
    levelScore: 50,
    streak: 0,
    totalSolved: 0,
    totalCorrect: 0,
    xp: 120,
    history: [],
    masteryByTopic: {},
  });

  const [currentTask, setCurrentTask] = useState<MathTask | null>(null);
  const [taskSequenceNum, setTaskSequenceNum] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [revealedHint1, setRevealedHint1] = useState<boolean>(false);
  const [revealedHint2, setRevealedHint2] = useState<boolean>(false);
  const [aiCoachingHint, setAiCoachingHint] = useState<string | null>(null);
  const [isLoadingAiHint, setIsLoadingAiHint] = useState<boolean>(false);

  // Auto-advance & AI task states
  const [isAutoAdvanceEnabled, setIsAutoAdvanceEnabled] = useState<boolean>(true);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Refs to guarantee NO stale closures or repeat questions
  const seenQuestionsRef = useRef<Set<string>>(new Set());
  const seenTaskIdsRef = useRef<Set<string>>(new Set());
  const currentLevelRef = useRef<TaskLevel>(profile.currentLevel);
  const timerRef = useRef<any>(null);
  const currentTaskQuestionRef = useRef<string | null>(null);

  // Keep currentLevelRef in sync with state
  useEffect(() => {
    currentLevelRef.current = profile.currentLevel;
  }, [profile.currentLevel]);

  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const gradeTopics = CURRICULUM_DATA[selectedGrade] || [];

  const filteredTopics = useMemo(() => {
    return gradeTopics.filter((t) => {
      const matchQuarter = selectedQuarter === 'ALL' || t.quarter === selectedQuarter;
      const matchSubject = selectedSubject === 'ALL' || t.subject === selectedSubject;
      return matchQuarter && matchSubject;
    });
  }, [gradeTopics, selectedQuarter, selectedSubject]);

  const currentTopic = useMemo(() => {
    const found = gradeTopics.find((t) => t.id === selectedTopicId);
    return found || filteredTopics[0] || gradeTopics[0];
  }, [selectedTopicId, gradeTopics, filteredTopics]);

  // Clean timer helper
  const cancelAutoAdvance = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setAutoAdvanceCountdown(null);
  };

  // Pick or generate next adaptive task
  const pickNextTask = async (targetLevel: TaskLevel, forceAiApi = false) => {
    // Cancel any running countdown immediately
    cancelAutoAdvance();

    // Reset interaction states
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsAnswerCorrect(false);
    setAttempts(0);
    setRevealedHint1(false);
    setRevealedHint2(false);
    setAiCoachingHint(null);

    // 1. If running under a custom assignment set assigned by teacher
    if (customTaskSet && customTaskSet.tasks.length > 0) {
      let pool = customTaskSet.tasks.filter((t) => t.level === targetLevel);
      if (pool.length === 0) pool = customTaskSet.tasks;
      const unseen = pool.filter((t) => !seenTaskIdsRef.current.has(t.id));
      
      // If there are still unseen tasks from the teacher's set, show the next unseen task
      if (unseen.length > 0) {
        const picked = unseen[0];
        seenTaskIdsRef.current.add(picked.id);
        seenQuestionsRef.current.add(picked.question);
        currentTaskQuestionRef.current = picked.question;
        setCurrentTask(picked);
        setTaskSequenceNum((prev) => prev + 1);
        return;
      }
      // If all tasks from customTaskSet have already been completed,
      // DO NOT repeat the same static task! Fall through to generate fresh dynamic tasks for this topic!
    }

    if (!currentTopic) return;

    // 2. Procedural Dynamic Task Generation:
    // Generate a fresh task guaranteed to differ from the current question
    const currentQ = currentTaskQuestionRef.current;
    let freshTask = generateProceduralTask(
      currentTopic,
      targetLevel,
      selectedGrade,
      currentQ || undefined,
      taskSequenceNum
    );
    let attemptsCount = 0;

    while (
      (seenQuestionsRef.current.has(freshTask.question) || (currentQ && freshTask.question === currentQ)) &&
      attemptsCount < 8
    ) {
      attemptsCount++;
      freshTask = generateProceduralTask(
        currentTopic,
        targetLevel,
        selectedGrade,
        currentQ || undefined,
        taskSequenceNum + attemptsCount * 10
      );
    }

    // Keep seenQuestionsRef bounded to last 30 questions
    if (seenQuestionsRef.current.size > 30) {
      const arr = Array.from(seenQuestionsRef.current);
      seenQuestionsRef.current = new Set(arr.slice(-15));
    }

    seenQuestionsRef.current.add(freshTask.question);
    currentTaskQuestionRef.current = freshTask.question;
    setCurrentTask(freshTask);
    setTaskSequenceNum((prev) => prev + 1);

    // 3. If forceAiApi is explicitly requested, fetch from Gemini AI
    if (forceAiApi) {
      setIsAiGenerating(true);
      try {
        const res = await fetch('/api/generate-adaptive-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grade: selectedGrade,
            topicTitle: currentTopic.title,
            sectionCode: currentTopic.sectionCode,
            level: targetLevel,
            previousQuestions: Array.from(seenQuestionsRef.current).slice(-4),
          }),
        });
        const data = await res.json();
        if (data.success && data.task && data.task.question) {
          const aiGeneratedTask: MathTask = {
            id: `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            grade: selectedGrade,
            subject: currentTopic.subject,
            quarter: currentTopic.quarter,
            sectionCode: currentTopic.sectionCode,
            topicId: currentTopic.id,
            topicTitle: currentTopic.title,
            level: targetLevel,
            levelLabel:
              targetLevel === 'A'
                ? 'А: Базалық деңгей (Білу және түсіну)'
                : targetLevel === 'B'
                ? 'В: Қолдану деңгейі'
                : 'С: Талдау және терең ойлау',
            learningObjective: currentTopic.learningObjectives[0] || 'Есепті шешу',
            question: data.task.question,
            options: data.task.options,
            correctAnswer: data.task.correctAnswer,
            hint1: data.task.hint1 || 'Формулаға сүйеніп есептеңіз',
            hint2: data.task.hint2 || 'Алгоритмді ретімен орындаңыз',
            solutionSteps: data.task.solutionSteps || [data.task.correctAnswer],
            descriptor: data.task.descriptor || 'Тапсырманы дұрыс орындайды',
            points: data.task.points || (targetLevel === 'A' ? 1 : targetLevel === 'B' ? 2 : 3),
            visualData:
              data.task.visualType && data.task.visualType !== 'none'
                ? { type: data.task.visualType }
                : undefined,
          };
          seenQuestionsRef.current.add(aiGeneratedTask.question);
          currentTaskQuestionRef.current = aiGeneratedTask.question;
          setCurrentTask(aiGeneratedTask);
        }
      } catch (err) {
        console.warn('AI task fetch fallback to procedural task:', err);
      } finally {
        setIsAiGenerating(false);
      }
    }
  };

  // Sync selected topic if it's no longer in the filtered list
  useEffect(() => {
    if (filteredTopics.length > 0 && !filteredTopics.some((t) => t.id === selectedTopicId)) {
      setSelectedTopicId(filteredTopics[0].id);
    }
  }, [selectedGrade, selectedQuarter, selectedSubject, filteredTopics, selectedTopicId]);

  // Initial load or topic change: clear history and pick fresh task
  useEffect(() => {
    seenQuestionsRef.current.clear();
    currentTaskQuestionRef.current = null;
    pickNextTask(profile.currentLevel);
  }, [selectedGrade, selectedTopicId, customTaskSet]);

  // Auto-advance countdown timer lifecycle
  useEffect(() => {
    if (autoAdvanceCountdown === null) return;
    if (autoAdvanceCountdown <= 0) {
      cancelAutoAdvance();
      pickNextTask(currentLevelRef.current);
      return;
    }
    timerRef.current = setTimeout(() => {
      setAutoAdvanceCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoAdvanceCountdown]);

  const handleSoundToggle = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.setMuted(nextState);
  };

  const handleOptionClick = (opt: string) => {
    if (isAnswerSubmitted && isAnswerCorrect) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = async () => {
    if (!currentTask || !selectedOption) return;

    const isCorrect = selectedOption.trim() === currentTask.correctAnswer.trim();
    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);
    setIsAnswerSubmitted(true);
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      sound.playCorrect();
      const pointsGained = currentTask.points * 10;
      const nextStreak = profile.streak + 1;

      let newLevel = profile.currentLevel;
      let levelUpBanner: string | null = null;

      // Adaptive level up on consecutive correct answers
      if (nextStreak >= 2) {
        if (profile.currentLevel === 'A') {
          newLevel = 'B';
          levelUpBanner = 'Құттықтаймыз! Сіз В деңгейіне (Қолдану) көтерілдіңіз! 🚀';
          sound.playLevelUp();
        } else if (profile.currentLevel === 'B') {
          newLevel = 'C';
          levelUpBanner = 'Керемет нәтиже! Сіз С деңгейіне (Талдау және логика) көтерілдіңіз! 🏆';
          sound.playLevelUp();
        }
      }

      currentLevelRef.current = newLevel;
      setLevelUpMessage(levelUpBanner);
      if (levelUpBanner) {
        setTimeout(() => setLevelUpMessage(null), 4000);
      }

      setProfile((prev) => ({
        ...prev,
        currentLevel: newLevel,
        levelScore: Math.min(prev.levelScore + 20, 100),
        streak: nextStreak,
        totalSolved: prev.totalSolved + 1,
        totalCorrect: prev.totalCorrect + 1,
        xp: prev.xp + pointsGained,
      }));

      // Trigger auto-advance countdown if enabled
      if (isAutoAdvanceEnabled) {
        setAutoAdvanceCountdown(2);
      }
    } else {
      sound.playWrong();
      setProfile((prev) => ({
        ...prev,
        streak: 0,
        levelScore: Math.max(prev.levelScore - 15, 10),
        totalSolved: prev.totalSolved + 1,
      }));

      if (!revealedHint1) {
        setRevealedHint1(true);
      }

      if (currentAttempts >= 2 && !aiCoachingHint) {
        fetchAiCoaching(currentAttempts);
      }
    }
  };

  const fetchAiCoaching = async (attemptCount: number) => {
    if (!currentTask) return;
    setIsLoadingAiHint(true);
    try {
      const res = await fetch('/api/adaptive-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentTask.question,
          studentAnswer: selectedOption,
          correctAnswer: currentTask.correctAnswer,
          level: currentTask.level,
          topic: currentTask.topicTitle,
          grade: currentTask.grade,
          attemptCount,
        }),
      });
      const data = await res.json();
      if (data.hint) {
        setAiCoachingHint(data.hint);
        sound.playHint();
      }
    } catch {
      setAiCoachingHint(currentTask.hint2);
    } finally {
      setIsLoadingAiHint(false);
    }
  };

  const handleNextQuestion = () => {
    cancelAutoAdvance();
    pickNextTask(currentLevelRef.current);
  };

  const handleManualLevelChange = (lvl: TaskLevel) => {
    cancelAutoAdvance();
    currentLevelRef.current = lvl;
    setProfile((prev) => ({
      ...prev,
      currentLevel: lvl,
      streak: 0,
      levelScore: 50,
    }));
    pickNextTask(lvl);
  };

  const handleDiagnosticComplete = (recommendedLevel: TaskLevel) => {
    cancelAutoAdvance();
    currentLevelRef.current = recommendedLevel;
    setProfile((prev) => ({
      ...prev,
      currentLevel: recommendedLevel,
      streak: 0,
      levelScore: 60,
    }));
    pickNextTask(recommendedLevel);
  };

  const accuracyRate = profile.totalSolved > 0
    ? Math.round((profile.totalCorrect / profile.totalSolved) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Custom Assignment Banner */}
      {customTaskSet && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-3xl p-4 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-xs text-indigo-700 font-extrabold uppercase tracking-wider">
                Мұғалімнің тапсырмасы орындалуда
              </div>
              <div className="text-slate-900 font-black text-sm sm:text-base">
                {customTaskSet.title} (Код: {customTaskSet.code})
              </div>
            </div>
          </div>
          {onClearCustomSet && (
            <button
              type="button"
              onClick={onClearCustomSet}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl bg-white border border-slate-300 shadow-xs transition cursor-pointer"
            >
              Жалпы режимге қайту
            </button>
          )}
        </div>
      )}

      {/* Adaptive Progression & Stats Bar: Bright, High Contrast */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-5 border-b border-slate-100">
          {/* Level indicator & manual override */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Сіздің ағымдағы деңгейіңіз
              </span>
              <div className="flex items-center gap-2 mt-1">
                {(['A', 'B', 'C'] as TaskLevel[]).map((lvl) => {
                  const isActive = profile.currentLevel === lvl;
                  const label =
                    lvl === 'A'
                      ? 'А: Базалық'
                      : lvl === 'B'
                      ? 'В: Қолдану'
                      : 'С: Талдау';
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleManualLevelChange(lvl)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? lvl === 'A'
                            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                            : lvl === 'B'
                            ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/40'
                            : 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <span>{label}</span>
                      {isActive && <CheckCircle2 size={13} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDiagnosticOpen(true)}
              className="ml-auto md:ml-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="3 сұрақтан тұратын экспресс-диагностика"
            >
              <BrainCircuit size={14} />
              <span className="hidden sm:inline">Диагностика</span>
            </button>
          </div>

          {/* Gamification Stats: Streak, XP, Accuracy */}
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-2xl border border-amber-200">
              <Flame size={18} className={profile.streak > 0 ? 'text-amber-600 animate-bounce' : 'text-slate-400'} />
              <div>
                <div className="text-[10px] text-amber-900 font-bold uppercase leading-none">Стрейк</div>
                <div className="text-sm font-black text-amber-700 font-mono">{profile.streak} 🔥</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-purple-50 px-3.5 py-1.5 rounded-2xl border border-purple-200">
              <Award size={18} className="text-purple-600" />
              <div>
                <div className="text-[10px] text-purple-900 font-bold uppercase leading-none">XP Ұпай</div>
                <div className="text-sm font-black text-purple-700 font-mono">{profile.xp}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-2xl border border-emerald-200">
              <TrendingUp size={18} className="text-emerald-600" />
              <div>
                <div className="text-[10px] text-emerald-900 font-bold uppercase leading-none">Дәлдік</div>
                <div className="text-sm font-black text-emerald-700 font-mono">{accuracyRate}%</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSoundToggle}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition cursor-pointer"
              title={isMuted ? 'Дыбысты қосу' : 'Дыбысты өшіру'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>

        {/* Grade, Quarter, Topic Selector for Student */}
        {!customTaskSet && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {([5, 6, 7, 8, 9] as GradeLevel[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGrade(g)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedGrade === g
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g}-сынып
                </button>
              ))}
            </div>

            {/* Quarter Filter */}
            <div>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value) as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Барлық тоқсандар</option>
                <option value={1}>1-тоқсан</option>
                <option value={2}>2-тоқсан</option>
                <option value={3}>3-тоқсан</option>
                <option value={4}>4-тоқсан</option>
              </select>
            </div>

            {/* Subject Filter (for 7-9 grades) */}
            {selectedGrade >= 7 ? (
              <div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Барлық пәндер</option>
                  <option value="Алгебра">Алгебра</option>
                  <option value="Геометрия">Геометрия</option>
                </select>
              </div>
            ) : null}

            {/* Topic Dropdown */}
            <div className={selectedGrade >= 7 ? 'md:col-span-1' : 'md:col-span-2'}>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {filteredTopics.map((top) => (
                  <option key={top.id} value={top.id}>
                    [{top.sectionCode}] {top.quarter}-тоқсан • {top.title} ({top.subject})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Level Up Banner */}
      {levelUpMessage && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold shadow-md flex items-center justify-between animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="animate-spin" />
            <span className="text-base">{levelUpMessage}</span>
          </div>
        </div>
      )}

      {/* Main Interactive Math Card: Light, Clear, Beautiful */}
      {currentTask && (
        <div
          key={currentTask.id}
          className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm relative animate-in fade-in duration-200"
        >
          {/* Card Top Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 font-black text-xs font-mono">
                №{taskSequenceNum} есеп
              </span>
              <span
                className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase ${
                  currentTask.level === 'A'
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : currentTask.level === 'B'
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}
              >
                {currentTask.level} деңгейі • {currentTask.points} балл
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
                <BrainCircuit size={13} className="text-purple-600" />
                <span>AI бейімделу белсенді</span>
              </span>
              <span className="text-xs text-slate-600 font-semibold hidden md:inline">
                {currentTask.sectionCode ? `${currentTask.sectionCode} • ` : ''}{currentTask.topicTitle}
              </span>
            </div>

            {/* Controls: Auto-advance toggle, Scratchpad, AI refresh */}
            <div className="flex items-center gap-2">
              <label
                title="Дұрыс жауап бергенде автоматты түрде келесі жаңа есепке өту"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition select-none"
              >
                <input
                  type="checkbox"
                  checked={isAutoAdvanceEnabled}
                  onChange={(e) => setIsAutoAdvanceEnabled(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="hidden sm:inline">Автоматты өту</span>
                <Zap size={13} className={isAutoAdvanceEnabled ? 'text-amber-500' : 'text-slate-400'} />
              </label>

              <button
                type="button"
                onClick={() => pickNextTask(currentLevelRef.current, true)}
                disabled={isAiGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Gemini AI арқылы тың тапсырма генерациялау"
              >
                <Sparkles size={13} className={isAiGenerating ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{isAiGenerating ? 'AI құрастыруда...' : 'AI жаңа есеп'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsScratchpadOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Шешу парағын ашу"
              >
                <PenTool size={13} />
                <span className="hidden sm:inline">Черновик</span>
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="my-6">
            <h3 className="text-lg md:text-xl font-extrabold text-slate-900 leading-relaxed">
              {currentTask.question}
            </h3>

            {currentTask.visualData && (
              <div className="my-4">
                <MathVisualizer data={currentTask.visualData} />
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-6">
            {currentTask.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              let btnClass = 'border-slate-200 bg-white text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40 shadow-xs';

              if (isAnswerSubmitted) {
                if (option === currentTask.correctAnswer) {
                  btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/40 font-bold';
                } else if (isSelected && !isAnswerCorrect) {
                  btnClass = 'border-rose-400 bg-rose-50 text-rose-950 font-bold';
                } else {
                  btnClass = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                btnClass = 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-600/30 font-bold';
              }

              return (
                <button
                  key={`${currentTask.id}-opt-${idx}`}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  disabled={isAnswerSubmitted && isAnswerCorrect}
                  className={`p-4 rounded-2xl border text-left text-sm md:text-base transition-all flex items-center justify-between group cursor-pointer ${btnClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-xs font-black text-slate-700 transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswerSubmitted && option === currentTask.correctAnswer && (
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isAnswerCorrect && (
                    <XCircle size={20} className="text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Live Auto-Advance Notification Banner */}
          {isAnswerSubmitted && isAnswerCorrect && autoAdvanceCountdown !== null && (
            <div className="w-full bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-in fade-in zoom-in-95 duration-200 my-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-mono font-black text-lg shadow-sm animate-pulse shrink-0">
                  {autoAdvanceCountdown}
                </div>
                <div>
                  <div className="text-emerald-950 font-black text-sm sm:text-base flex items-center gap-1.5">
                    <span>✓ Дұрыс жауап! Жаңа есепке автоматты түрде өтуде...</span>
                  </div>
                  <div className="text-emerald-800 text-xs font-semibold">
                    Келесі бейімделген тапсырма {autoAdvanceCountdown} секундта өздігінен ашылады.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={cancelAutoAdvance}
                  className="px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Pause size={14} />
                  <span>Кідірту (шешімді оқу)</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Дереу өту</span>
                  <FastForward size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Scaffolding & Adaptive Hints Drawer */}
          {(revealedHint1 || aiCoachingHint || (isAnswerSubmitted && !isAnswerCorrect)) && (
            <div className="space-y-3 my-6 animate-in fade-in duration-300">
              {revealedHint1 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs md:text-sm text-amber-950 flex items-start gap-3">
                  <Lightbulb size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-amber-900 mb-0.5">
                      1-ші бағыттаушы көмек (Формула):
                    </span>
                    {currentTask.hint1}
                  </div>
                </div>
              )}

              {aiCoachingHint && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs md:text-sm text-indigo-950 flex items-start gap-3 shadow-xs">
                  <Sparkles size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-indigo-900 mb-0.5">
                      AI Тәлімгер нұсқаулығы:
                    </span>
                    {aiCoachingHint}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step-by-Step Solution Breakdown */}
          {isAnswerSubmitted && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-indigo-600" /> Қадамдық шешу жолы:
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Дескриптор: {currentTask.descriptor}
                </span>
              </div>
              <div className="space-y-1 text-xs md:text-sm text-slate-800 font-mono">
                {currentTask.solutionSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Actions Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
            {!isAnswerCorrect && (
              <div className="flex items-center gap-2">
                {!revealedHint1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setRevealedHint1(true);
                      sound.playHint();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition cursor-pointer"
                  >
                    <Lightbulb size={15} />
                    <span>Көмек / Бағыт алу</span>
                  </button>
                )}

                {!aiCoachingHint && revealedHint1 && (
                  <button
                    type="button"
                    onClick={() => fetchAiCoaching(attempts + 1)}
                    disabled={isLoadingAiHint}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles size={15} className={isLoadingAiHint ? 'animate-spin' : ''} />
                    <span>{isLoadingAiHint ? 'AI ойлануда...' : 'AI түсіндірмесі'}</span>
                  </button>
                )}
              </div>
            )}

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => pickNextTask(currentLevelRef.current)}
                className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition cursor-pointer"
                title="Осы деңгейдегі басқа есепке ауысу"
              >
                <RotateCw size={14} />
                <span className="hidden sm:inline">Басқа есепке ауысу</span>
              </button>

              {!isAnswerSubmitted || !isAnswerCorrect ? (
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption}
                  className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Жауапты тексеру
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <span>Келесі есепке өту</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Scratchpad Canvas */}
      <Scratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      {/* Diagnostic Placement Pre-test Modal */}
      <DiagnosticTestModal
        isOpen={isDiagnosticOpen}
        grade={selectedGrade}
        onClose={() => setIsDiagnosticOpen(false)}
        onComplete={handleDiagnosticComplete}
      />
    </div>
  );
};
