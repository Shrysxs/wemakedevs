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
    return NextResponse.json({ ended_at: updated.ended_at }, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/focus/end:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

