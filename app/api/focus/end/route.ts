import { NextRequest, NextResponse } from 'next/server';
import { endFocusSession } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId } = body as { userId?: string; sessionId?: string };

    if (!userId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields: userId, sessionId' }, { status: 400 });
    }

    const updated = await endFocusSession(userId, sessionId);
    
    // Calculate duration in minutes
    const startTime = new Date(updated.started_at).getTime();
    const endTime = new Date(updated.ended_at!).getTime();
    const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));
    
    return NextResponse.json({ 
      success: true,
      data: {
        id: updated.id,
        userId: updated.user_id,
        startedAt: updated.started_at,
        endedAt: updated.ended_at,
        duration: durationMinutes,
        reclaimed: durationMinutes // For now, reclaimed = duration
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/focus/end:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

