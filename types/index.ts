export interface UserProfile {
  id: string;
  email: string;
  goal: string;
  skill: string;
  inspiration: string;
  distraction: string;
}

export interface AppUsage {
  name: string;
  minutes: number;
}

export interface UsageLog {
  id: string;
  userId: string;
  date: string;
  apps: AppUsage[];
}

export interface Alternative {
  type: string;
  title: string;
  url?: string;
  description?: string;
}

export interface Insight {
  id: string;
  userId: string;
  usageLogId: string;
  summary: string;
  nudges: string[];
  alternatives: Alternative[];
}

export interface FocusSession {
  id: string;
  userId: string;
  duration: number;
  reclaimed: number;
  startedAt: string;
  endedAt: string;
}
