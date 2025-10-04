// AI integration for generating personalized recommendations

export interface ProfileStub {
  goal?: string | null;
  skill?: string | null;
  inspiration?: string | null;
  distraction?: string | null;
}

export interface UsageLogStub {
  date?: string;
  apps?: { name: string; minutes: number }[];
}

export type UserProfileInput = Record<string, unknown> & ProfileStub;
export type UsageLogsInput = Array<Record<string, unknown>> & UsageLogStub[];

export interface RecommendationItem {
  title: string;
  description: string;
  link?: string;
}

/**
 * Helper function for generating YouTube search links
 */
function generateYouTubeLink(query: string): string {
  const encodedQuery = encodeURIComponent(query);
  return `https://www.youtube.com/results?search_query=${encodedQuery}`;
}

/**
 * getAIRecommendations(userProfile, usageLogs)
 * Generates 3 personalized recommendations based on user profile and usage data
 * 
 * @param userProfile - User's goals, skills, inspirations, and distractions
 * @param usageLogs - Array of usage logs with app usage data
 * @returns Array of 3 recommendation items
 */
export async function getAIRecommendations(
  userProfile: UserProfileInput,
  usageLogs: UsageLogsInput
): Promise<RecommendationItem[]> {
  const recommendations: RecommendationItem[] = [];
  
  // Extract user profile fields
  const { goal, skill, inspiration, distraction } = userProfile;
  
  // Calculate usage statistics
  const totalApps = usageLogs.flatMap(log => log.apps || []);
  const distractingApps = totalApps.filter(app => 
    app.name.toLowerCase().includes('social') ||
    app.name.toLowerCase().includes('game') ||
    app.name.toLowerCase().includes('youtube') ||
    app.name.toLowerCase().includes('instagram') ||
    app.name.toLowerCase().includes('facebook') ||
    app.name.toLowerCase().includes('twitter') ||
    app.name.toLowerCase().includes('tiktok')
  );
  
  const distractingTime = distractingApps.reduce((sum, app) => sum + app.minutes, 0);
  
  // Recommendation 1: Based on distraction
  if (distraction || distractingTime > 60) {
    const distractionTopic = distraction || 'social media';
    recommendations.push({
      title: `Overcome ${distractionTopic} Addiction`,
      description: `Learn proven strategies to reduce ${distractionTopic} usage and regain focus`,
      link: generateYouTubeLink(`overcome ${distractionTopic} addiction productivity`)
    });
  }
  
  // Recommendation 2: Based on goal
  if (goal) {
    recommendations.push({
      title: `Achieve Your Goal: ${goal}`,
      description: `Practical steps and motivation to reach your goal of ${goal}`,
      link: generateYouTubeLink(`how to ${goal}`)
    });
  }
  
  // Recommendation 3: Based on skill
  if (skill) {
    recommendations.push({
      title: `Master ${skill}`,
      description: `Expert tutorials and resources to improve your ${skill} skills`,
      link: generateYouTubeLink(`${skill} tutorial advanced`)
    });
  }
  
  // Recommendation 4: Based on inspiration
  if (inspiration && recommendations.length < 3) {
    recommendations.push({
      title: `Get Inspired by ${inspiration}`,
      description: `Learn from ${inspiration}'s journey and apply their strategies`,
      link: generateYouTubeLink(`${inspiration} motivation success story`)
    });
  }
  
  // Add combined skill + goal recommendation
  if (skill && goal && recommendations.length < 3) {
    recommendations.push({
      title: `${skill} for ${goal}`,
      description: `Targeted content combining your skill focus with your main goal`,
      link: generateYouTubeLink(`${skill} ${goal}`)
    });
  }
  
  // Add general productivity recommendation if needed
  if (recommendations.length < 3) {
    recommendations.push({
      title: 'Focus & Productivity Techniques',
      description: 'Learn proven methods to boost your focus and productivity',
      link: generateYouTubeLink('productivity techniques focus')
    });
  }
  
  // Ensure we have exactly 3 recommendations
  while (recommendations.length < 3) {
    recommendations.push({
      title: 'Personal Development',
      description: 'Resources for continuous learning and self-improvement',
      link: 'https://www.youtube.com/results?search_query=personal+development'
    });
  }
  
  return recommendations.slice(0, 3);
}
