import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { FocusSession } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, duration } = body as { userId?: string; duration?: number };

    if (!userId || typeof duration !== 'number' || duration <= 0) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid fields: userId, duration' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: userId,
        duration,
        reclaimed: 0,
        started_at: now,
        ended_at: now // Schema requires NOT NULL; will be updated on end
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error (focus/start):', error);
      return NextResponse.json(
        { success: false, error: 'Failed to start focus session', details: error.message },
        { status: 500 }
      );
    }

    const session: FocusSession = {
      id: data.id,
      userId: data.user_id,
      duration: data.duration,
      reclaimed: data.reclaimed,
      startedAt: data.started_at,
      endedAt: data.ended_at,
    };

    return NextResponse.json({ success: true, data: session }, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/focus/start:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
