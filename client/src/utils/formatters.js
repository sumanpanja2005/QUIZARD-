export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs} hr`;
};

export const formatSeconds = (seconds) => {
  if (!seconds && seconds !== 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const remSecs = seconds % 60;
  if (mins === 0) return `${remSecs}s`;
  return `${mins}m ${remSecs}s`;
};

export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'success';
    case 'hard':
      return 'danger';
    case 'medium':
    default:
      return 'warning';
  }
};

export const getSubjectColor = (subject) => {
  const map = {
    'Web Development': 'bg-blue-50 text-blue-700 border-blue-200',
    'Computer Science': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Mathematics: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Science: 'bg-purple-50 text-purple-700 border-purple-200',
    'General Knowledge': 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return map[subject] || 'bg-slate-100 text-slate-700 border-slate-200';
};
