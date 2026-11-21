import React from 'react';
import { Clock } from 'lucide-react';

export const Timer = ({ formattedTime, isUrgent, isCritical }) => {
  let colorClasses = 'bg-indigo-50 border-indigo-200 text-indigo-700';
  if (isCritical) {
    colorClasses = 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse ring-2 ring-rose-400';
  } else if (isUrgent) {
    colorClasses = 'bg-amber-50 border-amber-300 text-amber-700 animate-pulse';
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-base shadow-xs transition-colors duration-300 ${colorClasses}`}
    >
      <Clock className={`w-4 h-4 ${isCritical ? 'text-rose-600 animate-spin' : ''}`} />
      <span>{formattedTime}</span>
    </div>
  );
};

export default Timer;
