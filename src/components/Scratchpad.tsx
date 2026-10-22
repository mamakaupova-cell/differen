import React, { useRef, useState, useEffect } from 'react';
import { Pen, Eraser, Trash2, X, Minimize2, Maximize2 } from 'lucide-react';

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#2563eb'); // blue
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && canvas.width > 0) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = rect.width;
      canvas.height = rect.height;

      if (tempCtx && canvas.width > 0) {
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }
  }, [isOpen, isExpanded]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? 18 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 bg-white border border-slate-300 shadow-2xl rounded-2xl flex flex-col transition-all duration-200 overflow-hidden ${
        isExpanded
          ? 'inset-4 md:inset-10'
          : 'bottom-4 right-4 w-[94vw] sm:w-[480px] h-[390px]'
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-sm font-bold text-slate-800">
            Интерактивті Черновик / Тақта
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            (есептеу және сызба алаңы)
          </span>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsEraser(false)}
            className={`p-1.5 rounded-lg text-xs transition ${
              !isEraser
                ? 'bg-blue-100 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Қалам"
          >
            <Pen size={15} />
          </button>

          {/* Color palette */}
          {!isEraser && (
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              {['#2563eb', '#d97706', '#059669', '#dc2626', '#0f172a'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-slate-400' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsEraser(!isEraser)}
            className={`p-1.5 rounded-lg text-xs transition ${
              isEraser
                ? 'bg-rose-100 text-rose-700 font-bold border border-rose-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Өшіргіш"
          >
            <Eraser size={15} />
          </button>

          <button
            type="button"
            onClick={clearCanvas}
            className="p-1.5 rounded-lg text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Тазарту"
          >
            <Trash2 size={15} />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 transition"
            title={isExpanded ? 'Кішірейту' : 'Үлкейту'}
          >
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-xs text-slate-600 hover:text-rose-600 transition"
            title="Жабу"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 bg-white cursor-crosshair overflow-hidden touch-none">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block"
        />
      </div>

      {/* Footer hint */}
      <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
        <span>Тінтуір немесе сенсорлық экранмен формуланы еркін жазыңыз</span>
        <span className="font-mono text-blue-700 font-bold">Сызба қалыңдығы: {lineWidth}px</span>
      </div>
    </div>
  );
};
