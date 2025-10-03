import { NextRequest, NextResponse } from 'next/server';
import { startFocusSession } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body as { userId?: string };

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const row = await startFocusSession(userId);

    return NextResponse.json(
      { sessionId: row.id, started_at: row.started_at },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in /api/focus/start:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

