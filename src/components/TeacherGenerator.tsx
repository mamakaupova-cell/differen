import React, { useState, useMemo } from 'react';
import { GradeLevel, TaskSet, MathTask, TaskLevel, QuarterType, SubjectType } from '../types/math';
import { CURRICULUM_DATA } from '../data/curriculum';
import { MathVisualizer } from './MathVisualizer';
import { PrintWorksheetModal } from './PrintWorksheetModal';
import {
  Sparkles,
  BookOpen,
  Printer,
  Copy,
  Check,
  Play,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Layers,
  FileCheck
} from 'lucide-react';

interface TeacherGeneratorProps {
  onStartStudentPracticeWithSet: (taskSet: TaskSet) => void;
}

export const TeacherGenerator: React.FC<TeacherGeneratorProps> = ({
  onStartStudentPracticeWithSet,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(7);
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterType | 'ALL'>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('7-3A-short-mult');
  const [taskType, setTaskType] = useState<'БЖБ' | 'ТЖБ' | 'Практикалық' | 'Олимпиадалық'>('БЖБ');
  const [countPerLevel, setCountPerLevel] = useState<number>(1);
  const [customNote, setCustomNote] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeLevelTab, setActiveLevelTab] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [copied, setCopied] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [generatedSet, setGeneratedSet] = useState<TaskSet | null>(null);

  // Filter topics for selected grade according to Quarter, Subject, and Search query
  const gradeTopics = CURRICULUM_DATA[selectedGrade] || [];

  const filteredTopics = useMemo(() => {
    return gradeTopics.filter((t) => {
      const matchQuarter = selectedQuarter === 'ALL' || t.quarter === selectedQuarter;
      const matchSubject = selectedSubject === 'ALL' || t.subject === selectedSubject;
      const matchSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sectionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.learningObjectives.some((obj) => obj.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchQuarter && matchSubject && matchSearch;
    });
  }, [gradeTopics, selectedQuarter, selectedSubject, searchQuery]);

  const currentTopic = useMemo(() => {
    const found = gradeTopics.find((t) => t.id === selectedTopicId);
    return found || filteredTopics[0] || gradeTopics[0];
  }, [selectedTopicId, gradeTopics, filteredTopics]);

  // Sync selected topic if it's no longer in the filtered list
  React.useEffect(() => {
    if (filteredTopics.length > 0 && !filteredTopics.some((t) => t.id === selectedTopicId)) {
      setSelectedTopicId(filteredTopics[0].id);
    }
  }, [selectedGrade, selectedQuarter, selectedSubject, filteredTopics]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-task-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedGrade,
          topic: `${currentTopic?.sectionCode || ''} ${currentTopic?.title || ''}`,
          taskType,
          countPerLevel,
          customNote,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        const newSet: TaskSet = {
          id: `set-${Date.now()}`,
          title: d.title || `${selectedGrade}-сынып: ${currentTopic?.title} (${taskType})`,
          grade: selectedGrade,
          subject: currentTopic?.subject || 'Математика',
          quarter: currentTopic?.quarter || 1,
          topic: currentTopic?.title || 'Математика',
          sectionCode: currentTopic?.sectionCode,
          taskType,
          learningObjective: d.learningObjective || currentTopic?.learningObjectives?.[0] || 'Мемлекеттік стандарт',
          assessmentCriteria: d.assessmentCriteria || [
            'Негізгі ұғымдар мен ережелерді қолдана білу',
            'Шешу алгоритмін ретімен орындау',
            'Күрделі есептерде талдау жасау және дұрыс жауапты табу',
          ],
          tasks: (d.tasks || []).map((t: any, idx: number) => ({
            id: t.id || `gen-${idx}`,
            grade: selectedGrade,
            subject: currentTopic?.subject || 'Математика',
            quarter: currentTopic?.quarter || 1,
            sectionCode: currentTopic?.sectionCode,
            topicId: currentTopic?.id || 'gen',
            topicTitle: currentTopic?.title || 'Математика',
            level: (t.level?.toUpperCase() || 'A') as TaskLevel,
            levelLabel: t.levelLabel || (t.level === 'A' ? 'Базалық' : t.level === 'B' ? 'Қолдану' : 'Талдау'),
            learningObjective: d.learningObjective || currentTopic?.learningObjectives?.[0] || 'Мемлекеттік стандарт',
            question: t.question,
            options: t.options || [],
            correctAnswer: t.correctAnswer,
            hint1: t.hint1 || 'Есептің шартына назар салыңыз.',
            hint2: t.hint2 || 'Қадамдық алгоритмді қолданыңыз.',
            solutionSteps: t.solutionSteps || [t.correctAnswer],
            descriptor: t.descriptor || 'Тапсырманы дұрыс орындайды.',
            points: Number(t.points) || (t.level === 'A' ? 1 : t.level === 'B' ? 2 : 3),
            visualData: t.visualType && t.visualType !== 'none' ? { type: t.visualType as any } : undefined,
          })),
          totalPoints: d.totalPoints || 10,
          createdAt: new Date().toLocaleDateString('kk-KZ'),
          code: `MATH-${selectedGrade}${Math.floor(100 + Math.random() * 900)}`,
        };
        setGeneratedSet(newSet);
      } else {
        generateFallbackSet();
      }
    } catch {
      generateFallbackSet();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackSet = () => {
    const topic = currentTopic || gradeTopics[0];
    const baseTasks = topic?.sampleTasks || [];
    const randomizedCode = `DIF-${selectedGrade}${Math.floor(100 + Math.random() * 900)}`;

    const newSet: TaskSet = {
      id: `set-${Date.now()}`,
      title: `${selectedGrade}-сынып: ${topic?.sectionCode ? `${topic.sectionCode} ` : ''}${topic?.title} (${taskType})`,
      grade: selectedGrade,
      subject: topic?.subject || 'Математика',
      quarter: topic?.quarter || 1,
      topic: topic?.title || 'Математика',
      sectionCode: topic?.sectionCode,
      taskType,
      learningObjective: topic?.learningObjectives?.[0] || 'Мемлекеттік стандарт',
      assessmentCriteria: [
        'Тақырыпқа сай анықтамалар мен ережелерді қолданады',
        'Есептеулерді дұрыс алгоритммен орындайды',
        'Логикалық және мәтінмәндік есептерде қорытынды шығарады',
      ],
      tasks: baseTasks,
      totalPoints: baseTasks.reduce((sum, t) => sum + t.points, 0) || 6,
      createdAt: new Date().toLocaleDateString('kk-KZ'),
      code: randomizedCode,
    };
    setGeneratedSet(newSet);
  };

  React.useEffect(() => {
    generateFallbackSet();
  }, [selectedTopicId, selectedGrade, taskType]);

  const copyToClipboard = () => {
    if (!generatedSet) return;
    let text = `«AI-Differentiation» САРАЛАНҒАН ТАПСЫРМАЛАР ЖИНАҒЫ\n`;
    text += `Пән: ${generatedSet.subject} (${generatedSet.grade}-сынып, ${generatedSet.quarter}-тоқсан)\n`;
    text += `Бөлім: ${generatedSet.sectionCode || ''} «${generatedSet.topic}»\n`;
    text += `Оқу мақсаты: ${generatedSet.learningObjective}\n`;
    text += `Түрі: ${generatedSet.taskType} | Код: ${generatedSet.code}\n\n`;

    generatedSet.tasks.forEach((t, i) => {
      text += `[${t.level}-деңгей (${t.points} балл)] №${i + 1}. ${t.question}\n`;
      if (t.options.length > 0) {
        text += `   Нұсқалар: ${t.options.join(' | ')}\n`;
      }
      text += `   Дұрыс жауап: ${t.correctAnswer}\n`;
      text += `   Дескриптор: ${t.descriptor}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tasksToDisplay = generatedSet
    ? activeLevelTab === 'ALL'
      ? generatedSet.tasks
      : generatedSet.tasks.filter((t) => t.level === activeLevelTab)
    : [];

  return (
    <div className="space-y-6">
      {/* Configuration Card: Crisp, Bright, Clean */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> КТЖ Бағдарламасы бойынша • Саралау генераторы
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Интерактивті деңгейлік тапсырмалар жинағын құрастыру
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              5–9 сыныптардың күнтізбелік-тақырыптық жоспары (КТЖ) бойынша А, В, С деңгейлі есептер, дескрипторлар мен бағалау критерийлері.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold rounded-2xl shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? 'AI құрастыруда...' : 'Жаңа жинақ құрастыру'}</span>
          </button>
        </div>

        {/* Filters and Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {/* Grade Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Сынып (5-9)
            </label>
            <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              {([5, 6, 7, 8, 9] as GradeLevel[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGrade(g)}
                  className={`py-2 rounded-xl font-black text-sm transition cursor-pointer ${
                    selectedGrade === g
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Quarter Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Тоқсан
            </label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value) as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">Барлық тоқсандар</option>
              <option value={1}>1-тоқсан</option>
              <option value={2}>2-тоқсан</option>
              <option value={3}>3-тоқсан</option>
              <option value={4}>4-тоқсан</option>
            </select>
          </div>

          {/* Subject Filter (for 7-9 grades) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Пән бағыты
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">Барлық пәндер</option>
              {selectedGrade <= 6 ? (
                <option value="Математика">Математика</option>
              ) : (
                <>
                  <option value="Алгебра">Алгебра</option>
                  <option value="Геометрия">Геометрия</option>
                </>
              )}
            </select>
          </div>

          {/* Task Type selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Тапсырма түрі
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="БЖБ">БЖБ (Бөлімдік жиынтық бағалау)</option>
              <option value="ТЖБ">ТЖБ (Тоқсандық жиынтық бағалау)</option>
              <option value="Практикалық">Деңгейлік жаттығу парағы</option>
              <option value="Олимпиадалық">Олимпиадалық / Логикалық</option>
            </select>
          </div>
        </div>

        {/* Topic Selector with Search & Live Filter */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-600" />
              <span>КТЖ Бөлімі және Тақырыпты таңдау ({filteredTopics.length} тақырып табылды):</span>
            </label>
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Тақырып немесе мақсатты іздеу..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto p-1 border border-slate-200 rounded-2xl bg-slate-50/50">
            {filteredTopics.map((topic) => {
              const isSelected = currentTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`text-left p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                      {topic.sectionCode}
                    </span>
                    <span>{topic.quarter}-тоқсан • {topic.subject}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">
                    {topic.title}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {topic.learningObjectives[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Task Count Settings */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Sliders size={15} className="text-indigo-600" />
            <span className="font-semibold">Әр деңгейге есеп саны:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCountPerLevel(num)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    countPerLevel === num
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {num} есептен
                </button>
              ))}
            </div>
            <span className="text-slate-500 font-medium">(Барлығы: {countPerLevel * 3} сараланған тапсырма)</span>
          </div>

          <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Негізгі оқу мақсаты: <b className="text-indigo-700 font-mono">{currentTopic?.learningObjectives?.[0]?.slice(0, 8) || '5.1.2.1'}</b>
          </div>
        </div>
      </div>

      {/* Generated Set Display & Action Bar */}
      {generatedSet && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black text-lg">
                {generatedSet.grade}
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  {generatedSet.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    Код: {generatedSet.code}
                  </span>
                  <span>•</span>
                  <span>{generatedSet.subject} ({generatedSet.quarter}-тоқсан)</span>
                  <span>•</span>
                  <span>Жалпы балл: <b className="text-slate-800">{generatedSet.totalPoints}</b></span>
                  <span>•</span>
                  <span>{generatedSet.tasks.length} сараланған тапсырма</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStartStudentPracticeWithSet(generatedSet)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <Play size={14} />
                <span>Оқушы режимінде байқап көру</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition cursor-pointer"
              >
                <Printer size={15} />
                <span>Баспаға шығару</span>
              </button>

              <button
                type="button"
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition cursor-pointer"
              >
                {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                <span>{copied ? 'Көшірілді!' : 'Мәтінді көшіру'}</span>
              </button>
            </div>
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveLevelTab('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeLevelTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Барлық деңгейлер ({generatedSet.tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveLevelTab('A')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeLevelTab === 'A'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                А деңгейі (Базалық білім)
              </button>
              <button
                type="button"
                onClick={() => setActiveLevelTab('B')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeLevelTab === 'B'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                В деңгейі (Қолдану)
              </button>
              <button
                type="button"
                onClick={() => setActiveLevelTab('C')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeLevelTab === 'C'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                С деңгейі (Талдау & Логика)
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium hidden sm:block">
              Дескрипторлар мен шешу қадамдары қоса берілген
            </div>
          </div>

          {/* Differentiated Tasks Grid: Light Clean Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasksToDisplay.map((task, idx) => {
              const isLevelA = task.level === 'A';
              const isLevelB = task.level === 'B';
              const isLevelC = task.level === 'C';

              return (
                <div
                  key={task.id}
                  className={`bg-white border rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow ${
                    isLevelA
                      ? 'border-blue-200 ring-1 ring-blue-500/10'
                      : isLevelB
                      ? 'border-amber-200 ring-1 ring-amber-500/10'
                      : 'border-emerald-200 ring-1 ring-emerald-500/10'
                  }`}
                >
                  <div>
                    {/* Level header */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase ${
                          isLevelA
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : isLevelB
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {task.level} деңгейі • {task.points} балл
                      </span>
                      <span className="text-xs text-slate-400 font-mono font-bold">
                        №{idx + 1}
                      </span>
                    </div>

                    {/* Question text */}
                    <div className="text-slate-900 text-sm font-bold mb-3 leading-relaxed">
                      {task.question}
                    </div>

                    {/* Visualizer if present */}
                    {task.visualData && <MathVisualizer data={task.visualData} />}

                    {/* Options list */}
                    {task.options.length > 0 && (
                      <div className="space-y-1.5 my-3">
                        {task.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border ${
                              opt === task.correctAnswer
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span>
                              <b className="text-slate-500 mr-2">
                                {String.fromCharCode(65 + optIdx)})
                              </b>
                              {opt}
                            </span>
                            {opt === task.correctAnswer && (
                              <span className="text-[10px] uppercase font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                Дұрыс
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Descriptor */}
                    <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                      <span className="font-extrabold text-slate-500 block mb-0.5 uppercase text-[10px] tracking-wider">
                        Дескриптор:
                      </span>
                      {task.descriptor}
                    </div>
                  </div>

                  {/* Solution Preview Collapsible */}
                  <details className="mt-4 pt-3 border-t border-slate-100 text-xs group">
                    <summary className="cursor-pointer text-indigo-700 hover:text-indigo-900 font-bold select-none flex items-center justify-between">
                      <span>Толық шешу қадамдары</span>
                      <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="mt-2 space-y-1 text-slate-800 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {task.solutionSteps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-1.5">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Print Worksheet Modal */}
      <PrintWorksheetModal
        isOpen={showPrintModal}
        taskSet={generatedSet}
        onClose={() => setShowPrintModal(false)}
      />
    </div>
  );
};
