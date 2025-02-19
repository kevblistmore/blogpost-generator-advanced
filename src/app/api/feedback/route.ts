// app/api/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, rating, timestamp } = await request.json();
    // In production: store feedback in a DB
    console.log('User Feedback:', { content, rating, timestamp });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback submission failed:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
