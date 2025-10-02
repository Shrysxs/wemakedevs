import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAIRecommendations } from '@/lib/ai';
import { saveInsights } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // 1) Get userId from Supabase auth via Authorization: Bearer <token>
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = userRes.user.id;

    // 2) Fetch user profile + today’s usage logs
    const [{ data: profile, error: profileErr }, { data: usageLog, error: usageErr }] = await Promise.all([
      supabase
        .from('users')
        .select('id, email, goal, skill, inspiration, distraction')
        .eq('id', userId)
        .single(),
      (async () => {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('usage_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .single();
        // Return as object with keys matching destructure above
        return { data, error };
      })(),
    ]);

    if (profileErr) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile', details: profileErr.message },
        { status: 500 }
      );
    }

    if (usageErr?.code === 'PGRST116' || !usageLog) {
      return NextResponse.json(
        { success: false, error: 'No data to analyze' },
        { status: 400 }
      );
    }

    // 3) Call getAIRecommendations
    const suggestions = await getAIRecommendations(
      {
        goal: profile.goal ?? null,
        skill: profile.skill ?? null,
        inspiration: profile.inspiration ?? null,
        distraction: profile.distraction ?? null,
      },
      [
        {
          date: usageLog.date,
          apps: usageLog.apps ?? [],
        },
      ]
    );

    // 4) Save result into insights table (using daily table helper)
    await saveInsights(userId, suggestions);

    // 5) Return the suggestions as JSON
    return NextResponse.json({ success: true, data: suggestions }, { status: 200 });
  } catch (err: any) {
    console.error('Error in /api/generate-insights:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: err?.message },
      { status: 500 }
    );
  }
}
