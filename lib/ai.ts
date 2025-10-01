// AI integration stub for future LLaMA + Cerebras calls
// Swap implementations tomorrow by wiring real endpoints and API keys.

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
async function callLlamaModel(_usage: UsageLogStub, _profile: ProfileStub): Promise<InsightPayload> {
  // Placeholder: return deterministic content; integrate real API later
  return {
    summary: 'You spent 2h on Instagram at night, this impacts sleep.',
    nudges: ['Move your phone outside the bedroom.'],
    alternatives: [
      { type: 'video', title: 'DSA Crash Course', url: 'https://youtube.com/example' },
      { type: 'task', title: 'Leetcode 10 questions', description: 'Use that 2h for practice.' },
    ],
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
