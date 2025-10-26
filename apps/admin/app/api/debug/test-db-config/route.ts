import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;
    
    // Mask sensitive parts of the URLs
    const maskUrl = (url?: string) => {
      if (!url) return 'NOT SET';
      try {
        const urlObj = new URL(url);
        return `${urlObj.protocol}//${urlObj.username ? '***:***@' : ''}${urlObj.host}${urlObj.pathname}`;
      } catch {
        return 'INVALID URL';
      }
    };
    
    return NextResponse.json({
      success: true,
      databaseUrl: maskUrl(databaseUrl),
      directUrl: maskUrl(directUrl),
      hasDatabaseUrl: !!databaseUrl,
      hasDirectUrl: !!directUrl,
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

