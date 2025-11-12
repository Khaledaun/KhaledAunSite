/**
 * Newsletter Subscribe API Proxy
 * Proxies subscription requests from site app to admin app
 * POST /api/newsletter/subscribe
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward request to admin app API
    // Default to same origin if admin app runs on same port, or use environment variable
    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 
                       process.env.ADMIN_API_URL || 
                       request.headers.get('origin') || 
                       request.nextUrl.origin ||
                       'http://localhost:3000'; // Default to same origin
    
    const response = await fetch(`${adminApiUrl}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to subscribe' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Newsletter subscribe proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

