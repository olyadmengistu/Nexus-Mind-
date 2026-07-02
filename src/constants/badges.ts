import { Badge } from '../types';

export const BADGE_DEFINITIONS: Omit<Badge, 'earnedAt' | 'progress'>[] = [
  // Solving Badges
  {
    id: 'first_solve',
    name: 'First Steps',
    description: 'Solve your first problem',
    icon: '🎯',
    category: 'solving',
    rarity: 'common',
    maxProgress: 1
  },
  {
    id: 'five_solves',
    name: 'Problem Solver',
    description: 'Solve 5 problems',
    icon: '🔧',
    category: 'solving',
    rarity: 'common',
    maxProgress: 5
  },
  {
    id: 'ten_solves',
    name: 'Dedicated Solver',
    description: 'Solve 10 problems',
    icon: '⚙️',
    category: 'solving',
    rarity: 'common',
    maxProgress: 10
  },
  {
    id: 'fifty_solves',
    name: 'Expert Solver',
    description: 'Solve 50 problems',
    icon: '🏆',
    category: 'solving',
    rarity: 'rare',
    maxProgress: 50
  },
  {
    id: 'hundred_solves',
    name: 'Master Solver',
    description: 'Solve 100 problems',
    icon: '👑',
    category: 'solving',
    rarity: 'epic',
    maxProgress: 100
  },

  // Helping Badges
  {
    id: 'first_help',
    name: 'Helpful Hand',
    description: 'Provide your first helpful solution',
    icon: '🤝',
    category: 'helping',
    rarity: 'common',
    maxProgress: 1
  },
  {
    id: 'ten_helps',
    name: 'Community Helper',
    description: 'Provide 10 helpful solutions',
    icon: '💪',
    category: 'helping',
    rarity: 'common',
    maxProgress: 10
  },
  {
    id: 'fifty_helps',
    name: 'Mentor',
    description: 'Provide 50 helpful solutions',
    icon: '🎓',
    category: 'helping',
    rarity: 'rare',
    maxProgress: 50
  },
  {
    id: 'hundred_helps',
    name: 'Grand Mentor',
    description: 'Provide 100 helpful solutions',
    icon: '🌟',
    category: 'helping',
    rarity: 'epic',
    maxProgress: 100
  },

  // Streak Badges
  {
    id: 'seven_day_streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streaks',
    rarity: 'common',
    maxProgress: 7
  },
  {
    id: 'fourteen_day_streak',
    name: 'Fortnight Fighter',
    description: 'Maintain a 14-day streak',
    icon: '💥',
    category: 'streaks',
    rarity: 'rare',
    maxProgress: 14
  },
  {
    id: 'thirty_day_streak',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '⚡',
    category: 'streaks',
    rarity: 'rare',
    maxProgress: 30
  },
  {
    id: 'fifty_day_streak',
    name: 'Half Century',
    description: 'Maintain a 50-day streak',
    icon: '🌈',
    category: 'streaks',
    rarity: 'epic',
    maxProgress: 50
  },
  {
    id: 'hundred_day_streak',
    name: 'Century Champion',
    description: 'Maintain a 100-day streak',
    icon: '🏅',
    category: 'streaks',
    rarity: 'legendary',
    maxProgress: 100
  },

  // Expertise Badges
  {
    id: 'tech_expert',
    name: 'Tech Expert',
    description: 'Earn 100 reputation in Technology',
    icon: '💻',
    category: 'expertise',
    rarity: 'common',
    maxProgress: 100
  },
  {
    id: 'science_expert',
    name: 'Science Expert',
    description: 'Earn 100 reputation in Science',
    icon: '🔬',
    category: 'expertise',
    rarity: 'common',
    maxProgress: 100
  },
  {
    id: 'math_expert',
    name: 'Math Expert',
    description: 'Earn 100 reputation in Mathematics',
    icon: '📐',
    category: 'expertise',
    rarity: 'common',
    maxProgress: 100
  },
  {
    id: 'engineering_expert',
    name: 'Engineering Expert',
    description: 'Earn 100 reputation in Engineering',
    icon: '🔨',
    category: 'expertise',
    rarity: 'common',
    maxProgress: 100
  },
  {
    id: 'polymath',
    name: 'Polymath',
    description: 'Earn 100 reputation in 4 different categories',
    icon: '🧠',
    category: 'expertise',
    rarity: 'legendary',
    maxProgress: 4
  },

  // Social Badges
  {
    id: 'first_post',
    name: 'Voice Heard',
    description: 'Create your first post',
    icon: '📢',
    category: 'social',
    rarity: 'common',
    maxProgress: 1
  },
  {
    id: 'ten_posts',
    name: 'Active Contributor',
    description: 'Create 10 posts',
    icon: '✍️',
    category: 'social',
    rarity: 'common',
    maxProgress: 10
  },
  {
    id: 'fifty_posts',
    name: 'Prolific Writer',
    description: 'Create 50 posts',
    icon: '📝',
    category: 'social',
    rarity: 'rare',
    maxProgress: 50
  },
  {
    id: 'first_comment',
    name: 'Conversation Starter',
    description: 'Add your first comment',
    icon: '💬',
    category: 'social',
    rarity: 'common',
    maxProgress: 1
  },
  {
    id: 'fifty_comments',
    name: 'Social Butterfly',
    description: 'Add 50 comments',
    icon: '🦋',
    category: 'social',
    rarity: 'rare',
    maxProgress: 50
  },

  // Special Badges
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Join in the first month of launch',
    icon: '🚀',
    category: 'special',
    rarity: 'rare',
    maxProgress: 1
  },
  {
    id: 'top_contributor',
    name: 'Top Contributor',
    description: 'Reach top 10 on monthly leaderboard',
    icon: '🏆',
    category: 'special',
    rarity: 'epic',
    maxProgress: 1
  },
  {
    id: 'community_hero',
    name: 'Community Hero',
    description: 'Help 100 different users',
    icon: '🦸',
    category: 'special',
    rarity: 'legendary',
    maxProgress: 100
  }
];

export const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

export const RARITY_BORDER = {
  common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400'
};

export const CATEGORY_ICONS = {
  solving: '🎯',
  helping: '🤝',
  streaks: '🔥',
  expertise: '🧠',
  social: '💬',
  special: '⭐'
};
