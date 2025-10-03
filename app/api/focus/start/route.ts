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
      { 
        success: true,
        data: {
          id: row.id,
          userId: row.user_id,
          startedAt: row.started_at,
          duration: 0, // Will be calculated when ended
          reclaimed: 0 // Will be calculated when ended
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in /api/focus/start:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

