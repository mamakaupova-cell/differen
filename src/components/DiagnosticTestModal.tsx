import React, { useState } from 'react';
import { GradeLevel, TaskLevel } from '../types/math';
import { Award, CheckCircle2, ArrowRight, Sparkles, BrainCircuit, X } from 'lucide-react';
import { sound } from '../utils/sound';

interface DiagnosticTestModalProps {
  isOpen: boolean;
  grade: GradeLevel;
  onClose: () => void;
  onComplete: (recommendedLevel: TaskLevel) => void;
}

export const DiagnosticTestModal: React.FC<DiagnosticTestModalProps> = ({
  isOpen,
  grade,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const questionsByGrade: Record<GradeLevel, { q: string; opts: string[]; correct: number; level: TaskLevel }[]> = {
    5: [
      { q: 'Бөлімдері бірдей бөлшектер: 4/9 + 2/9 өрнегінің мәні неге тең?', opts: ['6/9 немесе 2/3', '6/18', '2/9', '8/9'], correct: 0, level: 'A' },
      { q: '150 санының 20%-ы қанша болады?', opts: ['30', '25', '15', '45'], correct: 0, level: 'B' },
      { q: 'Тік төртбұрыштың периметрі 36 см, ұзындығы енінен 2 есе ұзын. Ауданын табыңыз.', opts: ['72 см²', '144 см²', '36 см²', '48 см²'], correct: 0, level: 'C' },
    ],
    6: [
      { q: 'Өрнекті есептеңіз: -15 + 8 = ?', opts: ['-7', '7', '-23', '23'], correct: 0, level: 'A' },
      { q: 'Теңдеуді шешіңіз: 3x - 5 = 16', opts: ['x = 7', 'x = 6', 'x = 5', 'x = 8'], correct: 0, level: 'B' },
      { q: 'Пропорцияның белгісіз мүшесін табыңыз: x / 12 = 5 / 4', opts: ['15', '12', '10', '18'], correct: 0, level: 'C' },
    ],
    7: [
      { q: 'Қысқаша көбейту формуласы: (a - b)² неге тең?', opts: ['a² - 2ab + b²', 'a² - b²', 'a² + 2ab + b²', 'a² - ab + b²'], correct: 0, level: 'A' },
      { q: 'Теңдеуді шешіңіз: (x + 2)² - x² = 16', opts: ['x = 3', 'x = 4', 'x = 2', 'x = 5'], correct: 0, level: 'B' },
      { q: 'y = -2x + 8 түзуі координат осьтерімен шектелген үшбұрыштың ауданын табыңыз.', opts: ['16', '8', '32', '12'], correct: 0, level: 'C' },
    ],
    8: [
      { q: '√144 санының арифметикалық квадрат түбірі неше?', opts: ['12', '14', '24', '16'], correct: 0, level: 'A' },
      { q: 'x² - 7x + 10 = 0 теңдеуінің түбірлерін табыңыз.', opts: ['x₁ = 2, x₂ = 5', 'x₁ = -2, x₂ = -5', 'x₁ = 1, x₂ = 10', 'x₁ = -1, x₂ = -10'], correct: 0, level: 'B' },
      { q: 'Тікбұрышты үшбұрыштың гипотенузасы 13 см, катеті 5 см. Екінші катетін табыңыз.', opts: ['12 см', '8 см', '10 см', '11 см'], correct: 0, level: 'C' },
    ],
    9: [
      { q: 'Арифметикалық прогрессияда a₁ = 4, d = 3 болса, a₅ мәні қанша?', opts: ['16', '15', '19', '12'], correct: 0, level: 'A' },
      { q: 'Тригонометриялық теңдік: sin²30° + cos²30° неге тең?', opts: ['1', '0.5', '0', '√3/2'], correct: 0, level: 'B' },
      { q: 'Геометриялық прогрессияда b₁ = 2, q = 3 болса, алғашқы 4 мүшесінің қосындысы S₄ неше?', opts: ['80', '78', '82', '72'], correct: 0, level: 'C' },
    ],
  };

  const list = questionsByGrade[grade] || questionsByGrade[7];
  const activeQ = list[currentStep];

  const handleSelect = (idx: number) => {
    const updated = [...selectedAnswers, idx];
    setSelectedAnswers(updated);

    if (idx === activeQ.correct) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }

    if (currentStep < list.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
      sound.playLevelUp();
    }
  };

  const score = selectedAnswers.reduce((acc, ans, i) => (ans === list[i].correct ? acc + 1 : acc), 0);
  let recommended: TaskLevel = 'A';
  if (score >= 3) recommended = 'C';
  else if (score >= 2) recommended = 'B';
  else recommended = 'A';

  const reset = () => {
    setCurrentStep(0);
    setSelectedAnswers([]);
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-sm">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Диагностикалық бастапқы бағалау
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {grade}-сыныпқа арналған бейімделмелі деңгейді анықтау (3 сұрақ)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showResult ? (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                <span>Сұрақ {currentStep + 1} / {list.length}</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  {activeQ.level} деңгейі
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep + 1) / list.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
                <p className="text-slate-900 text-base font-semibold leading-relaxed">
                  {activeQ.q}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {activeQ.opts.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 text-slate-800 hover:text-indigo-950 transition-all text-sm font-semibold flex items-center gap-3 group shadow-xs"
                  >
                    <span className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-600 text-slate-700 group-hover:text-white flex items-center justify-center text-xs font-extrabold transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-indigo-600/20">
                <Award size={32} />
              </div>

              <h4 className="text-xl font-extrabold text-slate-900 mb-1">
                Диагностика сәтті аяқталды!
              </h4>
              <p className="text-sm text-slate-600 mb-6">
                3 сұрақтың <b className="text-indigo-600 font-extrabold">{score}</b>-не дұрыс жауап бердіңіз.
              </p>

              {/* Recommendation card */}
              <div className="bg-slate-50 border border-indigo-200 rounded-2xl p-5 mb-6 text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1 flex items-center gap-1.5">
                  <Sparkles size={14} /> Ұсынылатын бастапқы деңгей:
                </div>
                <div className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-black ${
                      recommended === 'A'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : recommended === 'B'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {recommended} деңгейі
                  </span>
                  <span>
                    {recommended === 'A'
                      ? 'Базалық деңгей'
                      : recommended === 'B'
                      ? 'Қолдану деңгейі'
                      : 'Жоғары/Тереңдетілген'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {recommended === 'A'
                    ? 'Сізге негізгі ұғымдар мен ережелерді бекіту үшін А деңгейінен бастау тиімді. Жүйе дұрыс жауаптарыңызға қарай күрделілік деңгейін автоматты түрде арттырады.'
                    : recommended === 'B'
                    ? 'Сіздің базалық дайындығыңыз жақсы. В деңгейіндегі есептерді шешу арқылы алгоритмдік және логикалық машықты шыңдаңыз.'
                    : 'Керемет көрсеткіш! Сіз күрделі және олимпиадалық С деңгейіндегі тереңдетілген математикалық есептерге дайынсыз.'}
                </p>
              </div>

              {/* Action */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
                >
                  Қайта тапсыру
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onComplete(recommended);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
                >
                  <span>Оқуды бастау</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
