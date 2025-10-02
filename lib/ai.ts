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
  const apiKey = process.env.CEREBRUS_API_KEY;
  if (!apiKey) {
    // Fail fast and remain safe: return a reasonable fallback
    return [
      {
        title: 'Set a clear daily goal',
        description: 'Define one concrete task for today and focus a 30-minute session on it.',
      },
      {
        title: 'Reduce night scrolling',
        description: 'Enable Do Not Disturb after 10 PM and charge your phone outside the bedroom.',
        link: 'https://support.google.com/android/answer/9068112?hl=en',
      },
      {
        title: 'Replace 20 minutes of social media',
        description: 'Pick a quick alternative like a DSA practice set or a short walk.',
      },
    ];
  }

  const url = process.env.CEREBRUS_API_URL || 'https://api.cerebrus.ai/v1/generate';
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
    // On API error, return safe defaults rather than throwing
    return [
      {
        title: 'Try a 15-minute focus block',
        description: 'Start small: one short focus session right now to build momentum.',
      },
      {
        title: 'Mute high-distraction apps',
        description: 'Temporarily silence notifications from your top 1–2 distracting apps.',
      },
      {
        title: 'Evening wind-down',
        description: 'Replace late-night scrolling with a 10-minute routine (stretching or reading).',
      },
    ];
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

  // Final fallback if API returns empty
  return [
    {
      title: 'Block a key distraction for 30 minutes',
      description: 'Use app timers or focus mode to pause your highest-usage app temporarily.',
    },
    {
      title: 'Pomodoro with a purpose',
      description: 'Pick one micro-task and do a 25-minute deep-focus session to complete it.',
      link: '/focus',
    },
    {
      title: 'Pre-bed routine',
      description: 'Set a phone-free window 30 minutes before sleep to improve rest quality.',
    },
  ];
}
