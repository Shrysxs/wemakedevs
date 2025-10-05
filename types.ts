// Shared TypeScript types for the application

export interface AppUsage {
  name: string;
  minutes: number;
}

export interface UsageLog {
  id?: string;
  user_id: string;
  date: string;
  apps: AppUsage[];
  created_at?: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string | null;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  goal?: string | null;
  skill?: string | null;
  inspiration?: string | null;
  distraction?: string | null;
  created_at?: string;
}

export interface Insight {
  id?: string;
  user_id: string;
  date: string;
  recommendations: RecommendationItem[];
  created_at?: string;
}

export interface RecommendationItem {
  title: string;
  description: string;
  link?: string;
}
