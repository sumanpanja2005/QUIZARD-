import React from 'react';

export const QuestionPalette = ({
  totalQuestions,
  currentIndex,
  answers = {},
  onSelectQuestion,
}) => {
  const answeredCount = Object.values(answers).filter((a) => a !== null && a !== undefined).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <h4 className="font-semibold text-slate-800 text-sm">Question Navigation</h4>
        <span className="text-xs text-slate-500 font-medium">
          {answeredCount}/{totalQuestions} Answered
        </span>
      </div>

      {/* Grid of numbers */}
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto pr-1">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = answers[index] !== undefined && answers[index] !== null;

          let btnClasses = 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200';
          if (isAnswered) {
            btnClasses = 'bg-indigo-600 text-white font-semibold shadow-xs';
          }
          if (isCurrent) {
            btnClasses += ' ring-2 ring-offset-2 ring-indigo-500 scale-105';
          }

          return (
            <button
              key={index}
              onClick={() => onSelectQuestion(index)}
              className={`h-10 rounded-xl flex items-center justify-center text-xs font-medium transition-all duration-150 ${btnClasses}`}
              aria-label={`Jump to Question ${index + 1}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-around text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-md bg-indigo-600" />
          <span>Answered ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-300" />
          <span>Unanswered ({unansweredCount})</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;
