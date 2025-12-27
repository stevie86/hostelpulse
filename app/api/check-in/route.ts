import { NextRequest, NextResponse } from 'next/server';
import { checkInGuest } from '@/app/actions/check-in-out';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await checkInGuest(formData);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Check-in API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
