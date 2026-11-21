import React from 'react';
import { HelpCircle } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = HelpCircle,
  title = 'No items found',
  description = 'There is currently no data to display.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-100 rounded-2xl shadow-xs">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
