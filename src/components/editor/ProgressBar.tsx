import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  dark?: boolean;
}

export default function ProgressBar({ current, total, dark }: ProgressBarProps) {
  const percentage = (current / total) * 100;
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 h-1 z-[105] ${dark ? 'bg-white/10' : 'bg-black/5'}`}>
      <div 
        className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
