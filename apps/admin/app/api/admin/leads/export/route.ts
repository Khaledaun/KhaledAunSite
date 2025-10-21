import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';
import { requireAdmin } from '@khaledaun/auth';

/**
 * GET /api/admin/leads/export
 * Export leads to CSV
 * 
 * Query params: Same as GET /api/admin/leads (filters apply)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    
    // Filters (same as main leads route)
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const interest = searchParams.get('interest');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (source) {
      where.source = source;
    }
    
    if (interest) {
      where.interest = interest;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get all leads matching filters (no pagination for export)
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Convert to CSV
    const csv = convertToCSV(leads);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting leads:', error);
    return NextResponse.json(
      { error: 'Failed to export leads' },
      { status: 500 }
    );
  }
}

function convertToCSV(leads: any[]): string {
  if (leads.length === 0) {
    return 'No leads to export';
  }

  // CSV headers
  const headers = [
    'ID',
    'Name',
    'Email',
    'Organization',
    'Country',
    'Interest',
    'Source',
    'Status',
    'Tags',
    'Message',
    'Next Action Date',
    'Created At',
    'Updated At',
  ];

  // CSV rows
  const rows = leads.map(lead => [
    lead.id,
    lead.name,
    lead.email,
    lead.organization || '',
    lead.country || '',
    lead.interest,
    lead.source,
    lead.status,
    lead.tags.join('; '),
    lead.message.replace(/"/g, '""'), // Escape quotes
    lead.nextActionAt ? new Date(lead.nextActionAt).toISOString() : '',
    new Date(lead.createdAt).toISOString(),
    new Date(lead.updatedAt).toISOString(),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

