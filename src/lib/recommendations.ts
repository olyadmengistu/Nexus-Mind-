import { INTERESTS, Interest } from '../constants/interests';
import { Post, User, Group, Video, Collaboration } from '../types';

// Calculate relevance score between user interests and content
export const calculateRelevanceScore = (
  userInterests: string[],
  contentTags: string[] = [],
  contentCategory: string = ''
): number => {
  let score = 0;
  
  // Direct interest matches
  userInterests.forEach(interestId => {
    const interest = INTERESTS.find(i => i.id === interestId);
    if (interest) {
      // Check if interest matches content tags
      if (contentTags.includes(interest.name.toLowerCase())) {
        score += 10;
      }
      // Check if interest category matches content category
      if (interest.category.toLowerCase() === contentCategory.toLowerCase()) {
        score += 5;
      }
    }
  });
  
  return score;
};

// Filter and sort posts by relevance to user interests
export const getRecommendedPosts = (
  posts: Post[],
  userInterests: string[]
): Post[] => {
  if (!userInterests || userInterests.length === 0) {
    return posts; // Return all posts if no interests selected
  }
  
  const scoredPosts = posts.map(post => ({
    post,
    score: calculateRelevanceScore(userInterests, post.category ? [post.category.toLowerCase()] : [], post.category)
  }));
  
  // Sort by relevance score (descending)
  scoredPosts.sort((a, b) => b.score - a.score);
  
  // Return posts with score > 0, or all posts if none have relevance
  const relevantPosts = scoredPosts.filter(item => item.score > 0).map(item => item.post);
  return relevantPosts.length > 0 ? relevantPosts : posts;
};

// Filter and sort users by shared interests
export const getRecommendedUsers = (
  users: User[],
  userInterests: string[],
  currentUserId: string
): User[] => {
  if (!userInterests || userInterests.length === 0) {
    return users.filter(u => u.id !== currentUserId).slice(0, 10);
  }
  
  const scoredUsers = users
    .filter(user => user.id !== currentUserId && user.interests)
    .map(user => {
      // Calculate shared interests count
      const sharedInterests = user.interests?.filter(interest => 
        userInterests.includes(interest)
      ) || [];
      
      return {
        user,
        score: sharedInterests.length
      };
    });
  
  // Sort by shared interests count (descending)
  scoredUsers.sort((a, b) => b.score - a.score);
  
  // Return users with at least 1 shared interest, or top users if none
  const relevantUsers = scoredUsers.filter(item => item.score > 0).map(item => item.user);
  return relevantUsers.length > 0 ? relevantUsers : users.filter(u => u.id !== currentUserId).slice(0, 10);
};

// Filter and sort groups by relevance to user interests
export const getRecommendedGroups = (
  groups: Group[],
  userInterests: string[]
): Group[] => {
  if (!userInterests || userInterests.length === 0) {
    return groups.slice(0, 10);
  }
  
  const scoredGroups = groups.map(group => ({
    group,
    score: calculateRelevanceScore(userInterests, group.category ? [group.category.toLowerCase()] : [], group.category)
  }));
  
  scoredGroups.sort((a, b) => b.score - a.score);
  
  const relevantGroups = scoredGroups.filter(item => item.score > 0).map(item => item.group);
  return relevantGroups.length > 0 ? relevantGroups : groups.slice(0, 10);
};

// Filter and sort videos by relevance to user interests
export const getRecommendedVideos = (
  videos: Video[],
  userInterests: string[]
): Video[] => {
  if (!userInterests || userInterests.length === 0) {
    return videos.slice(0, 10);
  }
  
  const scoredVideos = videos.map(video => {
    const tags = video.tags || [];
    const score = calculateRelevanceScore(userInterests, tags.map(t => t.toLowerCase()), video.category);
    return { video, score };
  });
  
  scoredVideos.sort((a, b) => b.score - a.score);
  
  const relevantVideos = scoredVideos.filter(item => item.score > 0).map(item => item.video);
  return relevantVideos.length > 0 ? relevantVideos : videos.slice(0, 10);
};

// Filter and sort collaborations by relevance to user interests
export const getRecommendedCollaborations = (
  collaborations: Collaboration[],
  userInterests: string[]
): Collaboration[] => {
  if (!userInterests || userInterests.length === 0) {
    return collaborations.slice(0, 10);
  }
  
  const scoredCollabs = collaborations.map(collab => {
    const skills = collab.requiredSkills || [];
    const score = calculateRelevanceScore(userInterests, skills.map(s => s.toLowerCase()), collab.category);
    return { collab, score };
  });
  
  scoredCollabs.sort((a, b) => b.score - a.score);
  
  const relevantCollabs = scoredCollabs.filter(item => item.score > 0).map(item => item.collab);
  return relevantCollabs.length > 0 ? relevantCollabs : collaborations.slice(0, 10);
};

// Get interest names from interest IDs
export const getInterestNames = (interestIds: string[]): string[] => {
  return interestIds.map(id => {
    const interest = INTERESTS.find(i => i.id === id);
    return interest ? interest.name : id;
  });
};

// Get recommended creators/experts based on interests
export const getRecommendedCreators = (
  users: User[],
  userInterests: string[],
  currentUserId: string
): User[] => {
  // Filter users with high reputation and shared interests
  const qualifiedUsers = users.filter(user => 
    user.id !== currentUserId && 
    user.reputation > 50 &&
    user.interests &&
    user.interests.some(interest => userInterests.includes(interest))
  );
  
  // Sort by reputation (descending)
  qualifiedUsers.sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
  
  return qualifiedUsers.slice(0, 5);
};

// Get trending interests (based on user count - would need backend analytics in production)
export const getTrendingInterests = (): Interest[] => {
  // For now, return a curated list of popular interests
  return [
    INTERESTS.find(i => i.id === 'tech-ai')!,
    INTERESTS.find(i => i.id === 'health-fitness')!,
    INTERESTS.find(i => i.id === 'biz-startup')!,
    INTERESTS.find(i => i.id === 'edu-online')!,
    INTERESTS.find(i => i.id === 'art-design')!,
    INTERESTS.find(i => i.id === 'sci-space')!,
    INTERESTS.find(i => i.id === 'life-travel')!,
    INTERESTS.find(i => i.id === 'social-activism')!
  ].filter(Boolean) as Interest[];
};
