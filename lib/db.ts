import { supabase } from '@/lib/supabase';

export type Suggestion = {
  title: string;
  description: string;
  link?: string;
};

/**
 * saveInsights(userId, suggestions)
 * Inserts a daily insights row for the given user (date = today by default).
 * Returns the inserted record.
 */
export async function saveInsights(userId: string, suggestions: Suggestion[], date?: string) {
  const today = date ?? new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('insights_daily')
    .insert({
      user_id: userId,
      date: today,
      suggestions,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`saveInsights failed: ${error.message}`);
  }

  return data;
}

/**
 * getLatestInsights(userId)
 * Fetch the most recent insights row for today (falls back to latest overall if none today).
 */
export async function getLatestInsights(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  // Try to get today's first
  let { data, error } = await supabase
    .from('insights_daily')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`getLatestInsights (today) failed: ${error.message}`);
  }

  if (data) return data;

  // Fallback: latest overall
  const fallback = await supabase
    .from('insights_daily')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fallback.error && fallback.error.code !== 'PGRST116') {
    throw new Error(`getLatestInsights (fallback) failed: ${fallback.error.message}`);
  }

  return fallback.data ?? null;
}
