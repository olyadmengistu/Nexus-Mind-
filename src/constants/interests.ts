export interface Interest {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
}

export const INTEREST_CATEGORIES = [
  'Technology',
  'Health & Wellness',
  'Business & Finance',
  'Education',
  'Creative Arts',
  'Science',
  'Lifestyle',
  'Social Impact'
];

export const INTERESTS: Interest[] = [
  // Technology
  { id: 'tech-ai', name: 'Artificial Intelligence', icon: '🤖', category: 'Technology', description: 'Machine learning, neural networks, AI applications' },
  { id: 'tech-web', name: 'Web Development', icon: '💻', category: 'Technology', description: 'Frontend, backend, full-stack development' },
  { id: 'tech-mobile', name: 'Mobile Apps', icon: '📱', category: 'Technology', description: 'iOS, Android, cross-platform development' },
  { id: 'tech-cloud', name: 'Cloud Computing', icon: '☁️', category: 'Technology', description: 'AWS, Azure, GCP, DevOps' },
  { id: 'tech-cyber', name: 'Cybersecurity', icon: '🔒', category: 'Technology', description: 'Network security, ethical hacking, data protection' },
  { id: 'tech-data', name: 'Data Science', icon: '📊', category: 'Technology', description: 'Analytics, visualization, big data' },
  { id: 'tech-iot', name: 'IoT & Smart Devices', icon: '🏠', category: 'Technology', description: 'Connected devices, home automation' },
  { id: 'tech-blockchain', name: 'Blockchain', icon: '⛓️', category: 'Technology', description: 'Cryptocurrency, DeFi, smart contracts' },

  // Health & Wellness
  { id: 'health-fitness', name: 'Fitness & Exercise', icon: '💪', category: 'Health & Wellness', description: 'Workouts, nutrition, healthy living' },
  { id: 'health-mental', name: 'Mental Health', icon: '🧠', category: 'Health & Wellness', description: 'Mindfulness, stress management, therapy' },
  { id: 'health-nutrition', name: 'Nutrition & Diet', icon: '🥗', category: 'Health & Wellness', description: 'Healthy eating, meal planning, supplements' },
  { id: 'health-medical', name: 'Medical Science', icon: '🏥', category: 'Health & Wellness', description: 'Healthcare, medicine, medical research' },
  { id: 'health-yoga', name: 'Yoga & Meditation', icon: '🧘', category: 'Health & Wellness', description: 'Mind-body practices, wellness routines' },
  { id: 'health-sleep', name: 'Sleep Health', icon: '😴', category: 'Health & Wellness', description: 'Sleep quality, sleep disorders, rest' },

  // Business & Finance
  { id: 'biz-startup', name: 'Startups', icon: '🚀', category: 'Business & Finance', description: 'Entrepreneurship, venture capital, scaling' },
  { id: 'biz-marketing', name: 'Digital Marketing', icon: '📈', category: 'Business & Finance', description: 'SEO, social media, content marketing' },
  { id: 'biz-finance', name: 'Personal Finance', icon: '💰', category: 'Business & Finance', description: 'Budgeting, investing, financial planning' },
  { id: 'biz-crypto', name: 'Cryptocurrency', icon: '₿', category: 'Business & Finance', description: 'Trading, DeFi, blockchain finance' },
  { id: 'biz-ecommerce', name: 'E-commerce', icon: '🛒', category: 'Business & Finance', description: 'Online selling, dropshipping, retail' },
  { id: 'biz-realestate', name: 'Real Estate', icon: '🏠', category: 'Business & Finance', description: 'Property investment, buying, selling' },

  // Education
  { id: 'edu-online', name: 'Online Learning', icon: '📚', category: 'Education', description: 'Coursera, Udemy, self-education' },
  { id: 'edu-languages', name: 'Language Learning', icon: '🌍', category: 'Education', description: 'New languages, translation, linguistics' },
  { id: 'edu-coding', name: 'Coding Education', icon: '⌨️', category: 'Education', description: 'Programming tutorials, bootcamps' },
  { id: 'edu-academic', name: 'Academic Research', icon: '🎓', category: 'Education', description: 'Papers, studies, scholarly work' },
  { id: 'edu-skills', name: 'Skill Development', icon: '🎯', category: 'Education', description: 'Professional skills, soft skills' },

  // Creative Arts
  { id: 'art-design', name: 'Graphic Design', icon: '🎨', category: 'Creative Arts', description: 'UI/UX, branding, visual design' },
  { id: 'art-photo', name: 'Photography', icon: '📷', category: 'Creative Arts', description: 'Digital, film, editing techniques' },
  { id: 'art-music', name: 'Music Production', icon: '🎵', category: 'Creative Arts', description: 'Beat making, mixing, composition' },
  { id: 'art-video', name: 'Video Production', icon: '🎬', category: 'Creative Arts', description: 'Editing, filmmaking, content creation' },
  { id: 'art-writing', name: 'Writing & Content', icon: '✍️', category: 'Creative Arts', description: 'Copywriting, blogging, storytelling' },
  { id: 'art-3d', name: '3D Modeling', icon: '🎮', category: 'Creative Arts', description: 'Blender, Maya, game assets' },

  // Science
  { id: 'sci-physics', name: 'Physics', icon: '⚛️', category: 'Science', description: 'Quantum, classical, applied physics' },
  { id: 'sci-biology', name: 'Biology', icon: '🧬', category: 'Science', description: 'Genetics, ecology, life sciences' },
  { id: 'sci-chemistry', name: 'Chemistry', icon: '⚗️', category: 'Science', description: 'Organic, materials, chemical engineering' },
  { id: 'sci-space', name: 'Space & Astronomy', icon: '🌌', category: 'Science', description: 'Astronomy, space exploration, cosmology' },
  { id: 'sci-env', name: 'Environmental Science', icon: '🌱', category: 'Science', description: 'Climate change, sustainability, ecology' },

  // Lifestyle
  { id: 'life-travel', name: 'Travel', icon: '✈️', category: 'Lifestyle', description: 'Adventure, tourism, cultural experiences' },
  { id: 'life-food', name: 'Food & Cooking', icon: '🍳', category: 'Lifestyle', description: 'Recipes, culinary arts, food culture' },
  { id: 'life-fashion', name: 'Fashion & Style', icon: '👗', category: 'Lifestyle', description: 'Trends, sustainable fashion, styling' },
  { id: 'life-diy', name: 'DIY & Crafts', icon: '🔧', category: 'Lifestyle', description: 'Home improvement, crafting, repairs' },
  { id: 'life-gaming', name: 'Gaming', icon: '🎮', category: 'Lifestyle', description: 'Video games, esports, game design' },
  { id: 'life-pets', name: 'Pets & Animals', icon: '🐕', category: 'Lifestyle', description: 'Pet care, training, animal welfare' },

  // Social Impact
  { id: 'social-activism', name: 'Social Activism', icon: '✊', category: 'Social Impact', description: 'Advocacy, community organizing, change' },
  { id: 'social-charity', name: 'Charity & Volunteering', icon: '❤️', category: 'Social Impact', description: 'Non-profits, giving back, community service' },
  { id: 'social-env', name: 'Sustainability', icon: '♻️', category: 'Social Impact', description: 'Eco-friendly living, zero waste' },
  { id: 'social-diversity', name: 'Diversity & Inclusion', icon: '🤝', category: 'Social Impact', description: 'Equity, representation, belonging' },
  { id: 'social-edu', name: 'Education Access', icon: '📖', category: 'Social Impact', description: 'Literacy, equal opportunity, learning' }
];

export const getInterestsByCategory = (category: string): Interest[] => {
  return INTERESTS.filter(interest => interest.category === category);
};

export const getInterestById = (id: string): Interest | undefined => {
  return INTERESTS.find(interest => interest.id === id);
};
