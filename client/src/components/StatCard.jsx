import React from 'react';

export const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  color = 'indigo',
  className = '',
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
  }[color] || {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-100',
  };

  return (
    <div
      className={`p-6 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colorMap.bg} ${colorMap.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        {subtext && <p className="mt-1 text-xs text-slate-500 font-medium">{subtext}</p>}
      </div>
    </div>
  );
};

export default StatCard;
