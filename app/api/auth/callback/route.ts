import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json() as { userId?: string; email?: string };

    if (!userId || !email) {
      return NextResponse.json({ success: false, error: 'Missing userId or email' }, { status: 400 });
    }

    // Upsert into users table with defaults
    const { error } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          id: userId,
          email,
          goal: null,
          skill: null,
          inspiration: null,
          distraction: null
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Supabase upsert user error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to upsert user profile', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { id: userId, email } });
  } catch (err: any) {
    console.error('Error in /api/auth/callback:', err);
    return NextResponse.json({ success: false, error: 'Internal server error', details: err?.message }, { status: 500 });
  }
}
