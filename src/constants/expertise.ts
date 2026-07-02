export const EXPERTISE_DOMAINS = [
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    color: '#3B82F6',
    subdomains: ['Programming', 'Web Development', 'Mobile Apps', 'DevOps', 'AI/ML', 'Cybersecurity']
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    color: '#10B981',
    subdomains: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Astronomy', 'Earth Sciences']
  },
  {
    id: 'engineering',
    name: 'Engineering',
    icon: '⚙️',
    color: '#F59E0B',
    subdomains: ['Mechanical', 'Electrical', 'Civil', 'Chemical', 'Aerospace', 'Software']
  },
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    color: '#8B5CF6',
    subdomains: ['Marketing', 'Finance', 'Management', 'Entrepreneurship', 'Economics', 'Strategy']
  },
  {
    id: 'arts',
    name: 'Arts & Design',
    icon: '🎨',
    color: '#EC4899',
    subdomains: ['Graphic Design', 'UI/UX', 'Photography', 'Writing', 'Music', 'Film']
  },
  {
    id: 'health',
    name: 'Health & Medicine',
    icon: '🏥',
    color: '#EF4444',
    subdomains: ['Medicine', 'Psychology', 'Nutrition', 'Fitness', 'Public Health', 'Mental Health']
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    color: '#6366F1',
    subdomains: ['Teaching', 'Curriculum', 'E-Learning', 'Research', 'Academic Writing', 'Training']
  },
  {
    id: 'law',
    name: 'Law & Legal',
    icon: '⚖️',
    color: '#78716C',
    subdomains: ['Corporate Law', 'Criminal Law', 'Intellectual Property', 'Contract Law', 'International Law', 'Compliance']
  }
];

export const EXPERTISE_LEVELS = [
  { level: 1, name: 'Novice', minScore: 0, maxScore: 100, icon: '🌱' },
  { level: 2, name: 'Beginner', minScore: 101, maxScore: 250, icon: '🌿' },
  { level: 3, name: 'Intermediate', minScore: 251, maxScore: 500, icon: '🌳' },
  { level: 4, name: 'Advanced', minScore: 501, maxScore: 1000, icon: '🏆' },
  { level: 5, name: 'Expert', minScore: 1001, maxScore: 2500, icon: '⭐' },
  { level: 6, name: 'Master', minScore: 2501, maxScore: 5000, icon: '👑' },
  { level: 7, name: 'Grandmaster', minScore: 5001, maxScore: Infinity, icon: '💎' }
];

export const getExpertiseLevel = (score: number) => {
  return EXPERTISE_LEVELS.find(level => score >= level.minScore && score <= level.maxScore) || EXPERTISE_LEVELS[0];
};

export const getExpertiseProgress = (score: number) => {
  const currentLevel = getExpertiseLevel(score);
  if (currentLevel.maxScore === Infinity) return 100;
  const range = currentLevel.maxScore - currentLevel.minScore;
  const progress = ((score - currentLevel.minScore) / range) * 100;
  return Math.min(Math.max(progress, 0), 100);
};
