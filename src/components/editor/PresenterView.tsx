import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { 
  X, 
  Clock, 
  Timer as TimerIcon, 
  ChevronRight, 
  ChevronLeft,
  RotateCcw
} from 'lucide-react';

interface PresenterViewProps {
  onClose: () => void;
  dark?: boolean;
}

export default function PresenterView({ onClose, dark }: PresenterViewProps) {
  const { 
    currentFrameIndex, 
    presentationPath, 
    objects,
    nextFrame,
    prevFrame
  } = useCanvasStore();

  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).filter((v, i) => v !== '00' || i > 0).join(':');
  };

  const currentFrameId = presentationPath[currentFrameIndex];
  const nextFrameId = presentationPath[currentFrameIndex + 1];

  const currentFrame = objects.find(o => o.id === currentFrameId);
  const nextFrame = objects.find(o => o.id === nextFrameId);

  const bgClass = dark ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900';
  const subBgClass = dark ? 'bg-white/5' : 'bg-black/5';

  return (
    <div className={`fixed inset-4 z-[120] rounded-3xl shadow-2xl border flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 ${bgClass} ${dark ? 'border-white/10' : 'border-black/10'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-current opacity-10 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <span className="text-sm font-bold tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TimerIcon size={18} className="text-primary" />
            <span className="text-sm font-bold tabular-nums">{formatTime(elapsedTime)}</span>
          </div>
        </div>
        
        <div className="flex-1 text-center">
          <h2 className="text-lg font-bold">Presenter View</h2>
        </div>

        <button onClick={onClose} className="p-2 rounded-full hover:bg-current hover:opacity-10 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-8 gap-8">
        {/* Left Side: Current & Next Preview */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Current Frame</h3>
            <div className={`flex-1 rounded-2xl border border-current opacity-10 overflow-hidden flex items-center justify-center relative ${subBgClass}`}>
              <div className="text-center p-4">
                <p className="text-lg font-medium">{currentFrame?.text || `Frame ${currentFrameIndex + 1}`}</p>
                <p className="text-xs opacity-50 mt-1">{currentFrameId}</p>
              </div>
              <div className="absolute bottom-4 right-4 text-[10px] font-bold opacity-30">
                {currentFrameIndex + 1} / {presentationPath.length}
              </div>
            </div>
          </div>

          <div className="h-1/3 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Next Up</h3>
            <div className={`flex-1 rounded-2xl border border-current opacity-10 overflow-hidden flex items-center justify-center relative ${subBgClass}`}>
              {nextFrame ? (
                <div className="text-center p-4">
                  <p className="text-sm font-medium">{nextFrame.text || `Frame ${currentFrameIndex + 2}`}</p>
                </div>
              ) : (
                <span className="text-xs opacity-30">End of Presentation</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Speaker Notes */}
        <div className="w-1/3 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Speaker Notes</h3>
          <div className={`flex-1 rounded-2xl p-6 border border-current opacity-10 overflow-y-auto ${subBgClass}`}>
            {currentFrame?.speakerNotes ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{currentFrame.speakerNotes}</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-4">
                <FileText size={48} className="mb-4" />
                <p className="text-sm">No notes for this frame.</p>
                <p className="text-xs mt-2">Add notes in the editor's properties panel.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="px-8 py-6 border-t border-current opacity-10 flex items-center justify-between shrink-0">
        <button 
          onClick={prevFrame} 
          disabled={currentFrameIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-current opacity-10 hover:opacity-20 transition-all disabled:opacity-5 text-sm font-bold"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1">
            {presentationPath.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentFrameIndex ? 'w-6 bg-primary' : 'bg-current opacity-10'}`}
              />
            ))}
          </div>
        </div>

        <button 
          onClick={nextFrame} 
          disabled={currentFrameIndex === presentationPath.length - 1}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/80 transition-all disabled:opacity-50 text-sm font-bold"
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
