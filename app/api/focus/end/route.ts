import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { FocusSession } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId } = body as { userId?: string; sessionId?: string };

    if (!userId || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, sessionId' },
        { status: 400 }
      );
    }

    // Fetch the session to get duration and validate ownership
    const { data: session, error: fetchError } = await supabase
      .from('focus_sessions')
      .select('id, user_id, duration, reclaimed, started_at, ended_at')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      const status = fetchError.code === 'PGRST116' ? 404 : 500;
      return NextResponse.json(
        { success: false, error: 'Session not found or fetch failed', details: fetchError.message },
        { status }
      );
    }

    const now = new Date().toISOString();

    // Update session: set ended_at=now and reclaimed=duration
    const { data: updated, error: updateError } = await supabase
      .from('focus_sessions')
      .update({
        ended_at: now,
        reclaimed: session.duration,
      })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase error (focus/end):', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to end focus session', details: updateError.message },
        { status: 500 }
      );
    }

    const response: FocusSession = {
      id: updated.id,
      userId: updated.user_id,
      duration: updated.duration,
      reclaimed: updated.reclaimed,
      startedAt: updated.started_at,
      endedAt: updated.ended_at,
    };

    return NextResponse.json({ success: true, data: response }, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/focus/end:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
