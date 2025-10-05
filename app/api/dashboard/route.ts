import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AppUsage } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Fetch today's usage log
    const { data: usageLog, error } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch usage log', details: error.message },
        { status: 500 }
      );
    }

    // If no usage log found for today, return empty data
    if (!usageLog) {
      return NextResponse.json({
        totalMinutes: 0,
        topApps: []
      });
    }

    // Calculate total minutes and sort apps by minutes
    const apps = (usageLog.apps || []) as AppUsage[];
    const totalMinutes = apps.reduce((sum: number, app: AppUsage) => sum + (Number(app.minutes) || 0), 0);
    
    // Sort apps by minutes (descending) and return all
    const topApps = [...apps].sort((a: AppUsage, b: AppUsage) => (Number(b.minutes) || 0) - (Number(a.minutes) || 0));

    return NextResponse.json({
      totalMinutes,
      topApps
    });
  } catch (error) {
    console.error('Error in /api/dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
