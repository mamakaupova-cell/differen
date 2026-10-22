import React from 'react';
import { TaskSet } from '../types/math';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface PrintWorksheetModalProps {
  taskSet: TaskSet | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintWorksheetModal: React.FC<PrintWorksheetModalProps> = ({
  taskSet,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !taskSet) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Баспаға дайын деңгейлік тапсырмалар парағы ({taskSet.taskType})
              </h3>
              <p className="text-xs text-slate-500">
                {taskSet.grade}-сынып • {taskSet.subject} • {taskSet.topic}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Printer size={16} />
              <span>Басып шығару (Печать)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/50 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Sheet Viewport */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-100 print:bg-white print:p-0">
          <div
            id="printable-worksheet"
            className="bg-white text-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto print:border-none print:shadow-none print:max-w-none print:p-4"
          >
            {/* Header info */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    {taskSet.subject}. {taskSet.grade}-сынып
                  </h1>
                  <h2 className="text-base font-bold text-indigo-900 mt-1">
                    {taskSet.taskType}: «{taskSet.sectionCode ? `${taskSet.sectionCode} ` : ''}{taskSet.topic}»
                  </h2>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <div className="font-bold text-slate-900">Жүйе коды: {taskSet.code}</div>
                  <div>Күні: ___________________</div>
                </div>
              </div>

              {/* Student Metadata Fields */}
              <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
                <div className="border-b border-dashed border-slate-400 pb-1">
                  <span className="font-bold text-slate-700">Оқушының аты-жөні:</span>{' '}
                  ____________________________________
                </div>
                <div className="border-b border-dashed border-slate-400 pb-1">
                  <span className="font-bold text-slate-700">Сыныбы:</span>{' '}
                  {taskSet.grade} «______» сынып
                </div>
              </div>

              {/* Objectives & Criteria */}
              <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <div>
                  <span className="font-bold text-slate-900">Оқу мақсаты (ГОСО):</span>{' '}
                  <span className="text-indigo-950 font-semibold">{taskSet.learningObjective}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Бағалау критерийлері:</span>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-700">
                    {taskSet.assessmentCriteria.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Differentiated Tasks Grouped by Level */}
            <div className="space-y-6">
              {(['A', 'B', 'C'] as const).map((lvl) => {
                const tasksInLevel = taskSet.tasks.filter((t) => t.level === lvl);
                if (tasksInLevel.length === 0) return null;

                const lvlBadgeColor =
                  lvl === 'A'
                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                    : lvl === 'B'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300';

                const lvlTitle =
                  lvl === 'A'
                    ? 'А деңгейі (Базалық білім және тану)'
                    : lvl === 'B'
                    ? 'В деңгейі (Қолдану және алгоритмдік дағды)'
                    : 'С деңгейі (Талдау, синтез және жоғары деңгей)';

                return (
                  <div key={lvl} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${lvlBadgeColor}`}>
                        {lvlTitle}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        Тапсырмалар саны: {tasksInLevel.length}
                      </span>
                    </div>

                    <div className="space-y-5">
                      {tasksInLevel.map((t, idx) => (
                        <div key={t.id} className="text-sm">
                          <div className="flex items-baseline gap-2 font-semibold text-slate-900">
                            <span className="font-extrabold text-indigo-900">
                              №{idx + 1} [{t.points} балл]:
                            </span>
                            <span className="flex-1">{t.question}</span>
                          </div>

                          {t.options && t.options.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-2 pl-6">
                              {t.options.map((opt, optIdx) => {
                                const letters = ['А', 'В', 'С', 'D'];
                                return (
                                  <div
                                    key={optIdx}
                                    className="p-1.5 bg-slate-50 border border-slate-200 rounded text-xs flex items-center gap-2"
                                  >
                                    <span className="font-bold text-slate-600">
                                      {letters[optIdx]})
                                    </span>
                                    <span>{opt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="mt-2.5 border border-dashed border-slate-300 rounded-lg p-2 text-[10px] text-slate-400 h-16 flex items-start">
                            Шешу жолы (жауабы):
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assessment Rubric Table */}
            <div className="mt-8 pt-6 border-t-2 border-slate-800">
              <h4 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 mb-2">
                Балл қою кестесі және дескрипторлар
              </h4>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 uppercase font-bold">
                  <tr>
                    <th className="border border-slate-300 p-2 w-12 text-center">№</th>
                    <th className="border border-slate-300 p-2 w-24 text-center">Деңгей</th>
                    <th className="border border-slate-300 p-2">Дескриптор</th>
                    <th className="border border-slate-300 p-2 w-16 text-center">Балл</th>
                  </tr>
                </thead>
                <tbody>
                  {taskSet.tasks.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 text-center font-bold">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        <span className="font-bold text-slate-900">{t.level} деңгей</span>
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-700">{t.descriptor}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-indigo-900">
                        {t.points}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={3} className="border border-slate-300 p-2 text-right">
                      Барлық балл:
                    </td>
                    <td className="border border-slate-300 p-2 text-center text-indigo-900">
                      {taskSet.totalPoints}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 flex justify-between items-center text-xs text-slate-600">
                <div>Мұғалімнің кері байланысы: _____________________________________________</div>
                <div className="font-bold">Қорытынды балл: _____ / {taskSet.totalPoints}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
