import React, { useState, useMemo } from 'react';
import { GradeLevel, QuarterType, SubjectType, MathTask } from '../types/math';
import { CURRICULUM_DATA, CURRICULUM_STATS } from '../data/curriculum';
import { BookOpen, Compass, Search, Clock, CheckCircle2, ChevronDown, ChevronUp, Layers, Sparkles } from 'lucide-react';

export const CurriculumOverview: React.FC = () => {
  const [activeGrade, setActiveGrade] = useState<GradeLevel>(7);
  const [activeQuarter, setActiveQuarter] = useState<QuarterType | 'ALL'>('ALL');
  const [activeSubject, setActiveSubject] = useState<SubjectType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const gradeTopics = CURRICULUM_DATA[activeGrade] || [];

  // Count topics per quarter for active grade
  const quarterCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    gradeTopics.forEach((t) => {
      counts[t.quarter] = (counts[t.quarter] || 0) + 1;
    });
    return counts;
  }, [gradeTopics]);

  const filteredTopics = useMemo(() => {
    return gradeTopics.filter((t) => {
      const matchQuarter = activeQuarter === 'ALL' || t.quarter === activeQuarter;
      const matchSubject = activeSubject === 'ALL' || t.subject === activeSubject;
      const matchSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sectionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.learningObjectives.some((obj) => obj.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchQuarter && matchSubject && matchSearch;
    });
  }, [gradeTopics, activeQuarter, activeSubject, searchQuery]);

  const toggleTopicExpand = (id: string) => {
    setExpandedTopicId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header & Concept Explanation */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>5–9 сыныптар • 1-4 тоқсан толық енгізілді ({CURRICULUM_STATS.totalSections} бөлім)</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Математика, Алгебра және Геометрия мемлекеттік оқу бағдарламасы (КТЖ)
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              ҚР Оқу-ағарту министрлігі бекіткен үлгілік бағдарлама бойынша барлық 4 тоқсанның бөлімдері, оқу мақсаттары және сараланған А, В, С деңгейлік тапсырмалар жинағы.
            </p>
          </div>

          {/* Grade selection */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {([5, 6, 7, 8, 9] as GradeLevel[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setActiveGrade(g);
                  setActiveQuarter('ALL');
                  setActiveSubject('ALL');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeGrade === g
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {g}-сынып
              </button>
            ))}
          </div>
        </div>

        {/* 3-Tier Differentiation Matrix Cards: Light and Clear */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Level A */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-900 text-xs font-black border border-blue-200">
                А ДЕҢГЕЙІ
              </span>
              <span className="text-xs text-blue-900 font-extrabold">1 балл</span>
            </div>
            <h4 className="text-slate-900 font-extrabold text-sm mb-1">
              Базалық білім және түсіну
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Математикалық ережелерді, формулалар мен анықтамаларды тану. Бір қадамды есептеулер және негізгі сандық амалдар.
            </p>
            <div className="text-[11px] text-blue-800 font-bold bg-white/90 p-2 rounded-xl border border-blue-100">
              Нәтиже: Негізгі ұғымдарды есте сақтап, қарапайым мысалдарда қатесіз қолданады.
            </div>
          </div>

          {/* Level B */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-950 text-xs font-black border border-amber-200">
                В ДЕҢГЕЙІ
              </span>
              <span className="text-xs text-amber-950 font-extrabold">2 балл</span>
            </div>
            <h4 className="text-slate-900 font-extrabold text-sm mb-1">
              Қолдану және алгоритмдік машық
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Бірнеше қадамнан тұратын теңдеулер, өрнектерді түрлендіру, сызбалар мен графиктер құру, стандартты жағдайларда шешім қабылдау.
            </p>
            <div className="text-[11px] text-amber-900 font-bold bg-white/90 p-2 rounded-xl border border-amber-100">
              Нәтиже: Алгоритмдерді өздігінен таңдап, логикалық байланыстарды жүзеге асырады.
            </div>
          </div>

          {/* Level C */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-950 text-xs font-black border border-emerald-200">
                С ДЕҢГЕЙІ
              </span>
              <span className="text-xs text-emerald-950 font-extrabold">3 балл</span>
            </div>
            <h4 className="text-slate-900 font-extrabold text-sm mb-1">
              Талдау, синтез және олимпиада
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Өмірлік мәтінмәндік күрделі есептер, параметрлік тапсырмалар, геометриялық дәлелдеулер мен шығармашылық логика.
            </p>
            <div className="text-[11px] text-emerald-900 font-bold bg-white/90 p-2 rounded-xl border border-emerald-100">
              Нәтиже: Жаңа стратегиялар құрып, математикалық тұжырымдарды негіздейді.
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for Curriculum Units */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Quarter tabs with exact counters */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveQuarter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeQuarter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Барлығы ({gradeTopics.length})
            </button>
            {[1, 2, 3, 4].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setActiveQuarter(q as any)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  activeQuarter === q ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{q}-тоқсан</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeQuarter === q ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {quarterCounts[q] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Subject filter (if 7-9) */}
          {activeGrade >= 7 && (
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveSubject('ALL')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeSubject === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Барлығы
              </button>
              <button
                type="button"
                onClick={() => setActiveSubject('Алгебра')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeSubject === 'Алгебра' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Алгебра
              </button>
              <button
                type="button"
                onClick={() => setActiveSubject('Геометрия')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeSubject === 'Геометрия' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Геометрия
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Оқу мақсатын немесе тақырыпты іздеу..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Curriculum Units Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={18} />
            <span>
              {activeGrade}-сынып: {activeQuarter === 'ALL' ? 'Барлық 4 тоқсан' : `${activeQuarter}-тоқсан`} бөлімдері ({filteredTopics.length} тақырыптық бөлім)
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Тапсырмаларды көру үшін бөлім карточкасындағы «Үлгі тапсырмалар» батырмасын басыңыз
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTopics.map((topic) => {
            const isExpanded = expandedTopicId === topic.id;
            return (
              <div
                key={topic.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200 font-mono">
                      {topic.sectionCode}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {topic.quarter}-тоқсан
                      </span>
                      <span>•</span>
                      <span className="text-indigo-700">{topic.subject}</span>
                      {topic.hours && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-slate-600">
                            <Clock size={12} /> {topic.hours} сағат
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <h4 className="text-base font-black text-slate-900 mb-2">
                    {topic.title}
                  </h4>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {topic.description}
                  </p>

                  {/* Objectives */}
                  <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Оқу мақсаттары (ГОСО / ҰМЖ):
                    </span>
                    {topic.learningObjectives.map((obj, idx) => (
                      <div key={idx} className="text-xs text-slate-800 flex items-start gap-2">
                        <span className="text-indigo-600 font-black">•</span>
                        <span className="font-medium">{obj}</span>
                      </div>
                    ))}
                  </div>

                  {/* Expandable Sample Tasks Section */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 animate-in fade-in duration-200">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-indigo-600" />
                        <span>Деңгейлік тапсырмалар үлгісі (A, B, C):</span>
                      </div>
                      {topic.sampleTasks.map((st) => (
                        <div
                          key={st.id}
                          className={`p-3.5 rounded-2xl border text-xs ${
                            st.level === 'A'
                              ? 'bg-blue-50/60 border-blue-200'
                              : st.level === 'B'
                              ? 'bg-amber-50/60 border-amber-200'
                              : 'bg-emerald-50/60 border-emerald-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-[11px] uppercase tracking-wider">
                              {st.levelLabel}
                            </span>
                            <span className="font-bold">{st.points} балл</span>
                          </div>
                          <div className="font-bold text-slate-900 mb-1.5">{st.question}</div>
                          <div className="grid grid-cols-2 gap-1 mb-2 text-[11px] text-slate-700">
                            {st.options.map((opt, i) => (
                              <div
                                key={i}
                                className={`px-2 py-1 rounded-lg border ${
                                  opt === st.correctAnswer
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                                    : 'bg-white/80 border-slate-200'
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            <span className="font-bold text-indigo-700">Көмек: </span> {st.hint1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sample Task levels badge & Toggle button */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-black text-[10px] border border-blue-200">
                      A
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-black text-[10px] border border-amber-200">
                      B
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 font-black text-[10px] border border-emerald-200">
                      C
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleTopicExpand(topic.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-slate-700 text-xs transition cursor-pointer"
                  >
                    <span>{isExpanded ? 'Жабу' : 'Үлгі есептерді көру'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
