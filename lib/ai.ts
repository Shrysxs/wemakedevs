// AI integration stub for future LLaMA + Cerebras calls
// Swap implementations tomorrow by wiring real endpoints and API keys.

// Declare process for Node.js environment
declare const process: {
  env: {
    [key: string]: string | undefined;
  };
} | undefined;

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

export interface InsightPayload {
  summary: string;
  nudges: string[];
  alternatives: Array<{ type: string; title: string; url?: string; description?: string }>;
}

// Mock external calls — replace with real fetch to LLaMA/Cerebras
async function callLlamaModel(usage: UsageLogStub, profile: ProfileStub): Promise<InsightPayload> {
  // Generate more accurate insights based on usage patterns and user profile
  const apps = usage.apps || [];
  const totalMinutes = apps.reduce((sum, app) => sum + app.minutes, 0);
  
  if (totalMinutes === 0) {
    return {
      summary: 'No usage data available for analysis.',
      nudges: ['Start tracking your app usage to get personalized insights.'],
      alternatives: [],
    };
  }

  // Analyze usage patterns
  const topApps = apps.sort((a, b) => b.minutes - a.minutes).slice(0, 3);
  const productiveApps = apps.filter(app => 
    app.name.toLowerCase().includes('code') || 
    app.name.toLowerCase().includes('dev') ||
    app.name.toLowerCase().includes('study') ||
    app.name.toLowerCase().includes('learn') ||
    app.name.toLowerCase().includes('book') ||
    app.name.toLowerCase().includes('read')
  );
  const distractingApps = apps.filter(app => 
    app.name.toLowerCase().includes('social') ||
    app.name.toLowerCase().includes('game') ||
    app.name.toLowerCase().includes('entertainment') ||
    app.name.toLowerCase().includes('video') ||
    app.name.toLowerCase().includes('youtube') ||
    app.name.toLowerCase().includes('instagram') ||
    app.name.toLowerCase().includes('facebook') ||
    app.name.toLowerCase().includes('twitter') ||
    app.name.toLowerCase().includes('tiktok')
  );

  const productiveTime = productiveApps.reduce((sum, app) => sum + app.minutes, 0);
  const distractingTime = distractingApps.reduce((sum, app) => sum + app.minutes, 0);
  const productivityRatio = totalMinutes > 0 ? (productiveTime / totalMinutes) * 100 : 0;

  // Generate detailed summary with time patterns and disruption analysis
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const timeString = totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${totalMinutes}m`;
  
  let summary = '';
  
  // Analyze top app usage patterns
  if (topApps.length > 0) {
    const topApp = topApps[0];
    const topAppHours = Math.floor(topApp.minutes / 60);
    const topAppMins = topApp.minutes % 60;
    const topAppTime = topAppHours > 0 ? `${topAppHours}h ${topAppMins}m` : `${topApp.minutes}m`;
    
    // Simulate time pattern analysis (in real implementation, this would come from actual usage timestamps)
    const isDisruptiveApp = distractingApps.some(app => app.name === topApp.name);
    
    if (isDisruptiveApp) {
      // Simulate peak usage times for disruptive apps
      const peakTimes = ['10PM–12AM', '2PM–4PM', '8AM–10AM'];
      const randomPeakTime = peakTimes[Math.floor(Math.random() * peakTimes.length)];
      
      summary += `You spent ${topAppTime} on ${topApp.name} between ${randomPeakTime}. `;
      
      if (randomPeakTime.includes('PM') && (randomPeakTime.includes('10') || randomPeakTime.includes('11'))) {
        summary += `This disrupted sleep patterns and reduced morning productivity. `;
      } else if (randomPeakTime.includes('AM') && randomPeakTime.includes('8')) {
        summary += `Breaking the pattern of checking ${topApp.name} first thing in the morning could improve your focus by 40%. `;
      } else {
        summary += `This occurred during peak work hours and may have impacted productivity. `;
      }
    } else {
      summary += `You spent ${topAppTime} on ${topApp.name}, which contributed positively to your goals. `;
    }
  }
  
  // Weekly comparison simulation
  if (distractingTime > 0) {
    const weeklyIncrease = Math.floor(Math.random() * 30) + 10; // Simulate 10-40% increase
    const peakWorkHours = ['10AM-2PM', '9AM-1PM', '11AM-3PM'];
    const randomWorkHours = peakWorkHours[Math.floor(Math.random() * peakWorkHours.length)];
    
    const mostDistracting = distractingApps.sort((a, b) => b.minutes - a.minutes)[0];
    if (mostDistracting) {
      summary += `Your ${mostDistracting.name} usage increased by ${weeklyIncrease}% this week, primarily during work hours (${randomWorkHours}). `;
    }
  }
  
  // Overall productivity assessment
  if (productivityRatio > 60) {
    summary += `Overall, ${productivityRatio.toFixed(0)}% of your ${timeString} was spent productively - excellent focus!`;
  } else if (productivityRatio > 30) {
    summary += `You maintained ${productivityRatio.toFixed(0)}% productive time out of ${timeString} total usage.`;
  } else {
    summary += `Only ${productivityRatio.toFixed(0)}% of your ${timeString} was productive. Consider time-blocking for better focus.`;
  }

  // Generate personalized nudges based on profile and usage
  const nudges: string[] = [];
  
  if (profile.goal) {
    if (profile.goal.toLowerCase().includes('coding') && productiveTime < 60) {
      nudges.push(`To achieve your ${profile.goal} goal, try to spend at least 1 hour daily on coding-related apps.`);
    }
    if (profile.goal.toLowerCase().includes('fitness') && !apps.some(app => app.name.toLowerCase().includes('fitness'))) {
      nudges.push(`Consider using fitness apps to track your ${profile.goal} progress.`);
    }
    if (profile.goal.toLowerCase().includes('reading') && !apps.some(app => app.name.toLowerCase().includes('read'))) {
      nudges.push(`Add reading apps to support your ${profile.goal} goal.`);
    }
  }

  if (distractingTime > 120) {
    nudges.push(`You spent ${distractingTime} minutes on potentially distracting apps. Try setting time limits.`);
  }

  if (profile.distraction && profile.distraction.toLowerCase().includes('morning') && usage.date) {
    nudges.push('Since you get distracted in the morning, consider using focus mode during your first few hours.');
  }

  if (nudges.length === 0) {
    nudges.push('Keep up the good work! Try to maintain this balance between productive and leisure time.');
  }

  // Generate alternatives based on user's skill and goal
  const alternatives: Array<{ type: string; title: string; url?: string; description?: string }> = [];
  
  if (profile.skill) {
    const skill = profile.skill.toLowerCase();
    if (skill.includes('dsa') || skill.includes('algorithm') || skill.includes('data structure')) {
      alternatives.push({
        type: 'Video',
        title: 'DSA Practice Videos',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(profile.skill)}+tutorial`,
        description: 'Structured learning videos for Data Structures and Algorithms'
      });
    }
    if (skill.includes('coding') || skill.includes('programming')) {
      alternatives.push({
        type: 'Practice',
        title: 'Coding Challenges',
        url: 'https://leetcode.com',
        description: 'Practice coding problems to improve your skills'
      });
    }
    if (skill.includes('web') || skill.includes('javascript') || skill.includes('react')) {
      alternatives.push({
        type: 'Tutorial',
        title: 'Web Development Course',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(profile.skill)}+course`,
        description: 'Comprehensive web development tutorials'
      });
    }
  }

  // Add general productivity alternatives
  if (distractingTime > productiveTime) {
    alternatives.push({
      type: 'App',
      title: 'Focus Timer',
      description: 'Use Pomodoro technique to improve focus and productivity'
    });
  }

  return {
    summary,
    nudges,
    alternatives,
  };
}

async function callCerebrasEnricher(result: InsightPayload): Promise<InsightPayload> {
  // Placeholder: pass-through; later augment/cross-check suggestions
  return result;
}

export async function generateInsights(usageLog: UsageLogStub | null, profile: ProfileStub | null): Promise<InsightPayload> {
  // Defensive defaults
  const safeUsage = usageLog ?? { date: undefined, apps: [] };
  const safeProfile = profile ?? { goal: null, skill: null, inspiration: null, distraction: null };

  // Step 1: LLaMA-style generation (stub)
  const llama = await callLlamaModel(safeUsage, safeProfile);

  // Step 2: Optional Cerebras post-processing (stub)
  const finalResult = await callCerebrasEnricher(llama);

  return finalResult;
}

// =============================
// Cerebrus API + Llama Integration
// =============================

export type UserProfileInput = Record<string, unknown> & ProfileStub;
export type UsageLogsInput = Array<Record<string, unknown>> & UsageLogStub[];

export interface RecommendationItem {
  title: string;
  description: string;
  link?: string;
}

/**
 * getAIRecommendations(userProfile, usageLogs)
 * Calls Cerebrus API using a small LLaMA model for fast reasoning and returns
 * 3 concrete, personalized suggestions.
 *
 * Env requirements:
 * - CEREBRUS_API_KEY: string (server-only)
 * - CEREBRUS_API_URL: string (optional, defaults provided)
 */
export async function getAIRecommendations(
  userProfile: UserProfileInput,
  usageLogs: UsageLogsInput
): Promise<RecommendationItem[]> {
  // Check if we have API key configured (server-side only)
  let apiKey: string | undefined;
  let url: string = 'https://api.cerebrus.ai/v1/generate';
  
  try {
    // This will only work on server-side
    apiKey = process?.env?.CEREBRUS_API_KEY;
    url = process?.env?.CEREBRUS_API_URL || 'https://api.cerebrus.ai/v1/generate';
  } catch {
    // Running on client-side or process is not available
    apiKey = undefined;
  }
  
  // If no API key, generate fallback recommendations based on user profile
  if (!apiKey) {
    return generateFallbackRecommendations(userProfile, usageLogs);
  }
  
  try {
    // Construct a compact prompt; the actual schema depends on the real API
    const payload = {
      model: 'llama-small', // small, fast LLaMA variant
      task: 'recommendations',
      max_suggestions: 3,
      input: {
        profile: userProfile,
        usage: usageLogs,
        instructions:
          'Return exactly 3 actionable, personalized suggestions as an array. Each item must have {title, description, link?}. Keep titles short and descriptions under 160 chars.',
      },
    } as const;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      // Keep modest timeout behavior via AbortController if needed later
    });

    if (!res.ok) {
      // On API error, return fallback recommendations
      return generateFallbackRecommendations(userProfile, usageLogs);
    }

    // Expected response structure: { suggestions: RecommendationItem[] }
    // Be defensive if the API returns unexpected payloads
    const data = (await res.json().catch(() => null)) as
      | { suggestions?: RecommendationItem[] }
      | null;

    const suggestions = Array.isArray(data?.suggestions) ? data!.suggestions : [];

    // Normalize and cap to 3
    const normalized = suggestions
      .map((s) => ({
        title: String((s as any).title || '').slice(0, 80),
        description: String((s as any).description || '').slice(0, 200),
        link: (s as any).link ? String((s as any).link) : undefined,
      }))
      .filter((s) => s.title && s.description)
      .slice(0, 3);

    if (normalized.length >= 1) return normalized;
  } catch (error) {
    console.error('Error calling AI API:', error);
  }

  // Final fallback if API returns empty or fails
  return generateFallbackRecommendations(userProfile, usageLogs);
}

// Generate intelligent fallback recommendations based on user profile
function generateFallbackRecommendations(
  userProfile: UserProfileInput,
  usageLogs: UsageLogsInput
): RecommendationItem[] {
  const recommendations: RecommendationItem[] = [];
  
  // Get user's skill and goal for targeted recommendations
  const skill = userProfile.skill?.toLowerCase() || '';
  const goal = userProfile.goal?.toLowerCase() || '';
  
  // Generate YouTube links following the format: www.youtube.com/[user's chosen task]
  const generateYouTubeLink = (task: string): string => {
    // Clean the task string and create a proper YouTube search URL
    const cleanTask = task.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const searchQuery = cleanTask.split(' ').join('+');
    return `https://www.youtube.com/results?search_query=${searchQuery}+tutorial`;
  };

  // DSA-focused recommendations based on user's skill
  if (skill.includes('dsa') || skill.includes('algorithm') || skill.includes('data structure')) {
    const dsaTask = userProfile.skill || 'DSA';
    recommendations.push({
      title: 'DSA Practice Videos',
      description: 'Comprehensive Data Structures and Algorithms tutorials tailored to your learning path',
      link: generateYouTubeLink(dsaTask)
    });
    
    // Add specific DSA topics
    recommendations.push({
      title: 'Array & String Problems',
      description: 'Master fundamental DSA concepts with array and string manipulation',
      link: generateYouTubeLink('array string DSA problems')
    });
  } else if (skill.includes('coding') || skill.includes('programming')) {
    const codingTask = userProfile.skill || 'coding';
    recommendations.push({
      title: 'Coding Practice Videos',
      description: 'Step-by-step coding tutorials and problem-solving techniques',
      link: generateYouTubeLink(codingTask)
    });
  } else if (skill) {
    recommendations.push({
      title: `${userProfile.skill} Learning Videos`,
      description: `Curated video content for mastering ${userProfile.skill}`,
      link: generateYouTubeLink(userProfile.skill || 'programming')
    });
  }
  
  // Goal-based recommendations with task-specific links
  if (goal.includes('coding') || goal.includes('programming')) {
    recommendations.push({
      title: 'Coding Challenge Platform',
      description: 'Practice coding problems and improve your programming skills',
      link: 'https://leetcode.com'
    });
    
    // Add DSA-specific coding content if not already added
    if (!skill.includes('dsa') && recommendations.length < 3) {
      recommendations.push({
        title: 'DSA for Coding Interviews',
        description: 'Essential data structures and algorithms for technical interviews',
        link: generateYouTubeLink('DSA coding interview preparation')
      });
    }
  } else if (goal.includes('fitness')) {
    const fitnessTask = userProfile.goal || 'fitness';
    recommendations.push({
      title: 'Fitness Workout Videos',
      description: 'Guided workout sessions to help you achieve your fitness goals',
      link: generateYouTubeLink(fitnessTask)
    });
  } else if (goal.includes('reading')) {
    const readingTask = userProfile.goal || 'reading';
    recommendations.push({
      title: 'Reading Productivity Tips',
      description: 'Techniques to improve reading speed and comprehension',
      link: generateYouTubeLink(readingTask + ' productivity tips')
    });
  }
  
  // Add task-specific recommendations based on combined skill and goal
  if (skill && goal && recommendations.length < 3) {
    const combinedTask = `${userProfile.skill} ${userProfile.goal}`;
    recommendations.push({
      title: `${userProfile.skill} for ${userProfile.goal}`,
      description: `Targeted content combining your skill focus with your main goal`,
      link: generateYouTubeLink(combinedTask)
    });
  }
  
  // Add general productivity recommendation if we have less than 3
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
