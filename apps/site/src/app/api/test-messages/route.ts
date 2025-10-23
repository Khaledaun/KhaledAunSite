import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Try to load both message files
    const enMessages = await import('@/messages/en.json');
    const arMessages = await import('@/messages/ar.json');
    
    return NextResponse.json({
      success: true,
      en: {
        greeting: enMessages.default.Hero?.greeting || 'NOT FOUND',
        messageCount: Object.keys(enMessages.default).length
      },
      ar: {
        greeting: arMessages.default.Hero?.greeting || 'NOT FOUND',
        messageCount: Object.keys(arMessages.default).length
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

