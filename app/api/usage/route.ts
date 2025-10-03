import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AppUsage } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date, apps } = body as {
      userId?: string;
      date?: string;
      apps?: AppUsage[];
    };

    // Validate input
    if (!userId || !date || !apps) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, date, apps' },
        { status: 400 }
      );
    }

    if (!Array.isArray(apps)) {
      return NextResponse.json(
        { error: 'apps must be an array' },
        { status: 400 }
      );
    }

    // Basic per-item validation
    const normalizedApps: AppUsage[] = apps.map((a) => ({
      name: String(a.name ?? ''),
      minutes: Number(a.minutes ?? 0),
    })).filter((a) => a.name.length > 0 && Number.isFinite(a.minutes) && a.minutes >= 0);

    // Check if usage log already exists for this user and date
    const { data: existingLog, error: fetchError } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing usage log:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check existing usage log', details: fetchError.message },
        { status: 500 }
      );
    }

    let finalApps: AppUsage[];
    
    if (existingLog && existingLog.apps) {
      // Merge existing apps with new apps, accumulating minutes for same app names
      const existingApps = (existingLog.apps || []) as AppUsage[];
      const appMap = new Map<string, number>();
      
      // Add existing app usage
      existingApps.forEach(app => {
        appMap.set(app.name, (appMap.get(app.name) || 0) + Number(app.minutes || 0));
      });
      
      // Add new app usage
      normalizedApps.forEach(app => {
        appMap.set(app.name, (appMap.get(app.name) || 0) + Number(app.minutes || 0));
      });
      
      // Convert back to array
      finalApps = Array.from(appMap.entries()).map(([name, minutes]) => ({
        name,
        minutes
      }));
    } else {
      // No existing data, use new apps as-is
      finalApps = normalizedApps;
    }

    // Insert or update usage log with accumulated data
    const { data, error } = await supabase
      .from('usage_logs')
      .upsert({
        user_id: userId,
        date: date,
        apps: finalApps,
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save usage log', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in /api/usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
