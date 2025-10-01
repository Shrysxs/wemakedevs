import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AppUsage } from '@/types';

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

    // Calculate date range for last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // Last 7 days including today

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch last 7 days usage logs
    const { data: usageLogs, error } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch usage logs', details: error.message },
        { status: 500 }
      );
    }

    // Initialize daily minutes array with 0s for all 7 days
    const daily: number[] = [];
    const appMinutesMap: Record<string, number> = {};

    // Create a map of dates to usage logs
    type UsageRow = { date: string; apps: AppUsage[] | null };
    const logsByDate: Record<string, UsageRow> = {};
    (usageLogs as UsageRow[] | null)?.forEach((log) => {
      logsByDate[log.date] = log;
    });

    // Process each of the last 7 days
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const log = logsByDate[dateStr];
      
      if (log && log.apps) {
        const apps = (log.apps ?? []) as AppUsage[];
        const dayTotal = apps.reduce((sum: number, app: AppUsage) => {
          const minutes = Number(app.minutes || 0);
          // Aggregate app usage across all days
          appMinutesMap[app.name] = (appMinutesMap[app.name] || 0) + minutes;
          return sum + minutes;
        }, 0);
        daily.push(dayTotal);
      } else {
        daily.push(0);
      }
    }

    // Convert app minutes map to array and sort by minutes descending
    const apps = Object.entries(appMinutesMap).map(([name, minutes]) => ({
      name,
      minutes
    })).sort((a, b) => b.minutes - a.minutes);

    // Calculate streak (consecutive days with usage)
    let streak = 0;
    for (let i = daily.length - 1; i >= 0; i--) {
      if (daily[i] > 0) {
        streak++;
      } else {
        break;
      }
    }

    return NextResponse.json({
      daily,
      apps,
      streak,
      badges: []
    });
  } catch (error) {
    console.error('Error in /api/report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
