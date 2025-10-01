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

    // Insert or update usage log
    const { data, error } = await supabase
      .from('usage_logs')
      .upsert({
        user_id: userId,
        date: date,
        apps: normalizedApps,
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
