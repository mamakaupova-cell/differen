import React from 'react';
import { VisualData } from '../types/math';

interface MathVisualizerProps {
  data: VisualData;
}

export const MathVisualizer: React.FC<MathVisualizerProps> = ({ data }) => {
  if (!data) return null;

  switch (data.type) {
    case 'fraction': {
      const num = data.fractionNumerator || 1;
      const den = data.fractionDenominator || 4;
      const safeDen = Math.min(Math.max(den, 1), 24);
      const safeNum = Math.min(Math.max(num, 0), safeDen);

      return (
        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-xs my-3">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2 flex items-center justify-between">
            <span>{data.title || 'Көрнекі бөлшек моделі'}</span>
            <span className="font-mono text-xs bg-indigo-50 px-2.5 py-0.5 rounded-full text-indigo-700 font-bold border border-indigo-200">
              {safeNum} / {safeDen}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {/* Visual Bar */}
            <div
              className="grid h-10 w-full overflow-hidden rounded-xl border-2 border-indigo-200 bg-slate-50"
              style={{ gridTemplateColumns: `repeat(${safeDen}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: safeDen }).map((_, idx) => (
                <div
                  key={idx}
                  className={`border-r last:border-r-0 border-indigo-200/80 transition-colors flex items-center justify-center text-[11px] font-mono ${
                    idx < safeNum
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {idx < safeNum ? '✓' : ''}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600 pt-1">
              <span>Боялған бөлік: <b className="text-indigo-600 font-bold">{safeNum}</b></span>
              <span>Барлық тең бөлік: <b className="text-slate-800 font-bold">{safeDen}</b></span>
            </div>
          </div>
        </div>
      );
    }

    case 'triangle': {
      const sideA = data.sideA || 6;
      const sideB = data.sideB || 8;
      const sideC = data.sideC || 10;
      return (
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs my-3">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
            {data.title || 'Геометриялық сызба: Тікбұрышты үшбұрыш'}
          </div>
          <div className="flex justify-center items-center py-2">
            <svg viewBox="0 0 240 160" className="w-56 h-36">
              <defs>
                <pattern id="grid-light" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="240" height="160" fill="url(#grid-light)" rx="10" />

              {/* Right angle marker at (40, 130) */}
              <path d="M 40 115 L 55 115 L 55 130" fill="none" stroke="#059669" strokeWidth="2" />
              <circle cx="48" cy="122" r="2" fill="#059669" />

              {/* Triangle polygon */}
              <polygon
                points="40,30 180,130 40,130"
                fill="rgba(16, 185, 129, 0.12)"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Labels */}
              <text x="14" y="85" fill="#334155" fontSize="12" fontWeight="bold">a = {sideA}</text>
              <text x="100" y="148" fill="#334155" fontSize="12" fontWeight="bold">b = {sideB}</text>
              <text x="115" y="70" fill="#047857" fontSize="13" fontWeight="bold">c = {sideC}</text>
              
              {/* Vertices */}
              <circle cx="40" cy="30" r="4" fill="#059669" />
              <text x="32" y="24" fill="#0f172a" fontSize="11" fontWeight="bold">A</text>
              <circle cx="180" cy="130" r="4" fill="#059669" />
              <text x="188" y="134" fill="#0f172a" fontSize="11" fontWeight="bold">B</text>
              <circle cx="40" cy="130" r="4" fill="#059669" />
              <text x="26" y="140" fill="#0f172a" fontSize="11" fontWeight="bold">C</text>
            </svg>
          </div>
          <div className="text-center text-xs text-slate-500 font-mono font-medium">
            Пифагор теоремасы: c² = a² + b² = {sideA}² + {sideB}² = {sideA * sideA + sideB * sideB}
          </div>
        </div>
      );
    }

    case 'parabola': {
      const a = data.a || 1;
      const b = data.b || -5;
      const c = data.c || 6;
      
      const scaleX = 14;
      const scaleY = 5;
      const centerX = 100;
      const centerY = 90;

      const pointsList: string[] = [];
      for (let x = -1; x <= 6; x += 0.2) {
        const y = a * x * x + b * x + c;
        const svgX = centerX + x * scaleX;
        const svgY = centerY - y * scaleY;
        if (svgY >= 10 && svgY <= 140) {
          pointsList.push(`${svgX.toFixed(1)},${svgY.toFixed(1)}`);
        }
      }

      return (
        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-xs my-3">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
            {data.title || 'Парабола графигі'}
          </div>
          <div className="flex justify-center items-center py-1">
            <svg viewBox="0 0 240 140" className="w-60 h-32 bg-slate-50 rounded-xl border border-slate-200">
              {/* Axes */}
              <line x1="20" y1={centerY} x2="220" y2={centerY} stroke="#94a3b8" strokeWidth="1.5" />
              <line x1={centerX} y1="130" x2={centerX} y2="10" stroke="#94a3b8" strokeWidth="1.5" />
              <polygon points={`220,${centerY} 214,${centerY - 3} 214,${centerY + 3}`} fill="#94a3b8" />
              <polygon points={`${centerX},10 ${centerX - 3},16 ${centerX + 3},16`} fill="#94a3b8" />
              <text x="215" y={centerY - 6} fill="#64748b" fontSize="10" fontWeight="bold">x</text>
              <text x={centerX + 6} y="15" fill="#64748b" fontSize="10" fontWeight="bold">y</text>

              {/* Curve */}
              {pointsList.length > 2 && (
                <polyline
                  points={pointsList.join(' ')}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Roots marker */}
              <circle cx={centerX + 2 * scaleX} cy={centerY} r="4" fill="#0284c7" />
              <text x={centerX + 2 * scaleX - 4} y={centerY + 15} fill="#0369a1" fontSize="10" fontWeight="bold">x₁=2</text>

              <circle cx={centerX + 3 * scaleX} cy={centerY} r="4" fill="#0284c7" />
              <text x={centerX + 3 * scaleX - 4} y={centerY + 15} fill="#0369a1" fontSize="10" fontWeight="bold">x₂=3</text>
            </svg>
          </div>
          <div className="text-center text-xs text-amber-900 font-mono font-medium pt-1">
            f(x) = {a !== 1 ? `${a}x²` : 'x²'} {b >= 0 ? `+ ${b}x` : `${b}x`} {c >= 0 ? `+ ${c}` : `${c}`}
          </div>
        </div>
      );
    }

    case 'linear_graph': {
      const k = data.a ?? -3;
      const b = data.b ?? 6;
      return (
        <div className="bg-white rounded-2xl p-4 border border-cyan-100 shadow-xs my-3">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-800 mb-2">
            {data.title || `y = ${k}x + ${b} түзуі`}
          </div>
          <div className="flex justify-center items-center py-1">
            <svg viewBox="0 0 240 140" className="w-60 h-32 bg-slate-50 rounded-xl border border-slate-200">
              <line x1="20" y1="70" x2="220" y2="70" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="120" y1="130" x2="120" y2="10" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="215" y="65" fill="#64748b" fontSize="10" fontWeight="bold">x</text>
              <text x={126} y={15} fill="#64748b" fontSize="10" fontWeight="bold">y</text>

              <line x1="60" y1="120" x2="160" y2="20" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="120" cy="40" r="4" fill="#e11d48" />
              <text x="126" y="44" fill="#be123c" fontSize="10" fontWeight="bold">(0; {b})</text>
            </svg>
          </div>
        </div>
      );
    }

    case 'number_line': {
      return (
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs my-3">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-800 mb-2">
            {data.title || 'Сан түзуі'}
          </div>
          <div className="flex justify-center items-center py-2">
            <svg viewBox="0 0 260 70" className="w-full h-16 bg-slate-50 rounded-xl border border-slate-200">
              <line x1="15" y1="35" x2="245" y2="35" stroke="#475569" strokeWidth="2" />
              <polygon points="245,35 237,31 237,39" fill="#475569" />
              <text x="242" y="25" fill="#0f172a" fontSize="11" fontWeight="bold">X</text>

              {/* Origin 0 */}
              <line x1="130" y1="28" x2="130" y2="42" stroke="#475569" strokeWidth="1.5" />
              <text x="127" y="55" fill="#0f172a" fontSize="11" fontWeight="bold">0</text>

              {/* Point -18 */}
              <circle cx="60" cy="35" r="4" fill="#e11d48" />
              <text x="48" y="23" fill="#be123c" fontSize="10" fontWeight="bold">-18</text>

              {/* Shift arc */}
              <path d="M 60 27 Q 115 5 170 27" fill="none" stroke="#7c3aed" strokeWidth="2" strokeDasharray="3,3" />
              <text x="105" y="14" fill="#6d28d9" fontSize="10" fontWeight="bold">+25</text>

              {/* Point +7 */}
              <circle cx="170" cy="35" r="4" fill="#059669" />
              <text x="165" y="55" fill="#047857" fontSize="11" fontWeight="bold">+7</text>
            </svg>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
