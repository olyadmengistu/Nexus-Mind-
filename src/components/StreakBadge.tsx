import React from 'react';

interface StreakBadgeProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showFire?: boolean;
  onClick?: () => void;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ 
  streak, 
  size = 'medium', 
  showLabel = true,
  showFire = true,
  onClick 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs px-2 py-1';
      case 'large':
        return 'text-xl px-4 py-2';
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  const getFireSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-3xl';
      default:
        return 'text-xl';
    }
  };

  const getStreakColor = () => {
    if (streak >= 30) return 'from-purple-500 to-pink-500';
    if (streak >= 14) return 'from-orange-500 to-red-500';
    if (streak >= 7) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-cyan-500';
  };

  const getStreakEmoji = () => {
    if (streak >= 100) return '🔥🔥🔥';
    if (streak >= 50) return '🔥🔥';
    if (streak >= 7) return '🔥';
    return '⚡';
  };

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-2 bg-gradient-to-r ${getStreakColor()} text-white rounded-full font-bold ${getSizeClasses()} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
    >
      {showFire && (
        <span className={getFireSize()}>
          {getStreakEmoji()}
        </span>
      )}
      {showLabel && (
        <span>
          {streak} day{streak !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default StreakBadge;
