import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateInsights } from '@/lib/ai';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing required parameter: userId' }, { status: 400 });
    }

    // Fetch last usage log (by date desc)
    const { data: lastUsage, error: usageError } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Supabase usage error:', usageError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch last usage log', details: usageError.message },
        { status: 500 }
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, goal, skill, inspiration, distraction')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Supabase profile error:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user profile', details: profileError.message },
        { status: 500 }
      );
    }

    // AI stub: call generateInsights with last usage + profile
    const data = await generateInsights(
      lastUsage ? { date: lastUsage.date, apps: lastUsage.apps ?? [] } : null,
      profile ? {
        goal: profile.goal ?? null,
        skill: profile.skill ?? null,
        inspiration: profile.inspiration ?? null,
        distraction: profile.distraction ?? null,
      } : null
    );

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in /api/insights:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
