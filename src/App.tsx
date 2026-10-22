import React, { useState } from 'react';
import { TeacherGenerator } from './components/TeacherGenerator';
import { StudentAdaptivePractice } from './components/StudentAdaptivePractice';
import { CurriculumOverview } from './components/CurriculumOverview';
import { TaskSet } from './types/math';
import {
  Calculator,
  Users,
  GraduationCap,
  Compass,
  Sparkles,
  BookCheck,
  CheckCircle2
} from 'lucide-react';

type AppTab = 'teacher' | 'student' | 'curriculum';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('teacher');
  const [activeCustomTaskSet, setActiveCustomTaskSet] = useState<TaskSet | null>(null);

  const handleStartStudentPracticeWithSet = (set: TaskSet) => {
    setActiveCustomTaskSet(set);
    setActiveTab('student');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearCustomSet = () => {
    setActiveCustomTaskSet(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation Bar: Bright White, Clean & Easy to Use */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Calculator size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                  AI-Differentiation
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-black uppercase">
                  5-9 сынып
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                ҚР Оқу-ағарту министрлігінің КТЖ бағдарламасы бойынша сараланған тапсырмалар
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('teacher')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Users size={16} />
              <span>Мұғалім кабинеті</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <GraduationCap size={16} />
              <span>Оқушы залы (Бейімделу)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('curriculum')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition hidden md:flex cursor-pointer ${
                activeTab === 'curriculum'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Compass size={16} />
              <span>КТЖ Бағдарламасы</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'teacher' && (
          <TeacherGenerator
            onStartStudentPracticeWithSet={handleStartStudentPracticeWithSet}
          />
        )}

        {activeTab === 'student' && (
          <StudentAdaptivePractice
            customTaskSet={activeCustomTaskSet}
            onClearCustomSet={handleClearCustomSet}
          />
        )}

        {activeTab === 'curriculum' && <CurriculumOverview />}
      </main>

      {/* Clean Educational Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">«AI-Differentiation» платформасы</span>
            <span>•</span>
            <span>5-9 сыныптардың математика, алгебра және геометрия курсы (1-4 тоқсан)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> А - Базалық
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> В - Қолдану
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> С - Талдау және олимпиада
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
