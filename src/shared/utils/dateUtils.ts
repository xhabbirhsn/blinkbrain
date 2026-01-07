/**
 * Format timestamp to readable date string
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Today
  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })}`;
  }

  // Yesterday
  if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })}`;
  }

  // This week
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  // Older
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric',
    year: diffDays > 365 ? 'numeric' : undefined
  });
};

/**
 * Format countdown duration in seconds to readable string
 */
export const formatCountdown = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};
