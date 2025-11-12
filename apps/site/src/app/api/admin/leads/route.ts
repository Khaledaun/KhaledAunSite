/**
 * Contact Form API Proxy
 * Proxies lead creation requests from site app to admin app
 * POST /api/admin/leads
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
    
    const response = await fetch(`${adminApiUrl}/api/admin/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to create lead' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Contact form proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}

