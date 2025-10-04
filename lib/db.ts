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

// =====================================
// Focus session helpers
// =====================================

export async function startFocusSession(userId: string) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('focus_sessions')
    .insert({ user_id: userId, started_at: now })
    .select()
    .single();

  if (error) {
    throw new Error(`startFocusSession failed: ${error.message}`);
  }

  return data;
}

export async function endFocusSession(userId: string, sessionId: string) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('focus_sessions')
    .update({ ended_at: now })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`endFocusSession failed: ${error.message}`);
  }

  return data;
}

