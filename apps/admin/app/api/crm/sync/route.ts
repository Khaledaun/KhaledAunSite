/**
 * CRM Sync API
 * POST /api/crm/sync - Sync recent subscribers and leads to HubSpot
 * 
 * Called by Vercel Cron nightly
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncSubscriberToHubSpot, syncLeadToHubSpot, isHubSpotConfigured } from '@/lib/crm/hubspot-client';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized CRM sync request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isHubSpotConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'HubSpot not configured, skipping sync',
        synced: 0,
      });
    }

    console.log('🔄 CRM sync started');

    // Sync confirmed subscribers who haven't been synced yet
    const subscribersToSync = await prisma.newsletterSubscriber.findMany({
      where: {
        status: 'confirmed',
        hubspotContactId: null,
      },
      take: 100, // Sync max 100 per run
      orderBy: {
        confirmedAt: 'desc',
      },
    });

    const subscriberResults = [];

    for (const subscriber of subscribersToSync) {
      try {
        const result = await syncSubscriberToHubSpot({
          email: subscriber.email,
          firstName: subscriber.firstName || undefined,
          lastName: subscriber.lastName || undefined,
          source: subscriber.source || 'newsletter',
          sourceUrl: subscriber.sourceUrl || undefined,
          utmSource: subscriber.utmSource || undefined,
          utmMedium: subscriber.utmMedium || undefined,
          utmCampaign: subscriber.utmCampaign || undefined,
        });

        if (result.success && result.contactId) {
          await prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: {
              hubspotContactId: result.contactId,
              hubspotSyncedAt: new Date(),
            },
          });

          subscriberResults.push({
            email: subscriber.email,
            success: true,
            contactId: result.contactId,
            isNew: result.isNew,
          });

          console.log(`✅ Synced subscriber: ${subscriber.email}`);
        } else {
          subscriberResults.push({
            email: subscriber.email,
            success: false,
            error: result.error,
          });

          console.error(`❌ Failed to sync subscriber ${subscriber.email}:`, result.error);
        }

        // Rate limiting - small delay between syncs
        await new Promise((resolve) => setTimeout(resolve, 100));

      } catch (error) {
        subscriberResults.push({
          email: subscriber.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        console.error(`❌ Error syncing subscriber ${subscriber.email}:`, error);
      }
    }

    // Sync pending leads
    const leadsToSync = await prisma.crmLead.findMany({
      where: {
        hubspotSyncStatus: 'pending',
      },
      take: 50, // Sync max 50 leads per run
      orderBy: {
        createdAt: 'desc',
      },
    });

    const leadResults = [];

    for (const lead of leadsToSync) {
      try {
        const result = await syncLeadToHubSpot({
          email: lead.email,
          firstName: lead.firstName || undefined,
          lastName: lead.lastName || undefined,
          company: lead.company || undefined,
          jobTitle: lead.jobTitle || undefined,
          phone: lead.phone || undefined,
          website: lead.website || undefined,
          message: lead.message || undefined,
          source: lead.source,
          sourceUrl: lead.sourceUrl || undefined,
          utmSource: lead.utmSource || undefined,
          utmMedium: lead.utmMedium || undefined,
          utmCampaign: lead.utmCampaign || undefined,
          utmTerm: lead.utmTerm || undefined,
          utmContent: lead.utmContent || undefined,
        });

        if (result.success && result.contactId) {
          await prisma.crmLead.update({
            where: { id: lead.id },
            data: {
              hubspotContactId: result.contactId,
              hubspotSyncStatus: 'synced',
              hubspotSyncedAt: new Date(),
              hubspotSyncError: null,
            },
          });

          leadResults.push({
            email: lead.email,
            success: true,
            contactId: result.contactId,
          });

          console.log(`✅ Synced lead: ${lead.email}`);
        } else {
          await prisma.crmLead.update({
            where: { id: lead.id },
            data: {
              hubspotSyncStatus: 'failed',
              hubspotSyncError: result.error,
            },
          });

          leadResults.push({
            email: lead.email,
            success: false,
            error: result.error,
          });

          console.error(`❌ Failed to sync lead ${lead.email}:`, result.error);
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

      } catch (error) {
        await prisma.crmLead.update({
          where: { id: lead.id },
          data: {
            hubspotSyncStatus: 'failed',
            hubspotSyncError: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        leadResults.push({
          email: lead.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        console.error(`❌ Error syncing lead ${lead.email}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    const subscribersSynced = subscriberResults.filter((r) => r.success).length;
    const leadsSynced = leadResults.filter((r) => r.success).length;

    console.log(`✅ CRM sync completed: ${subscribersSynced} subscribers, ${leadsSynced} leads (${duration}ms)`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      subscribers: {
        processed: subscriberResults.length,
        synced: subscribersSynced,
        failed: subscriberResults.length - subscribersSynced,
      },
      leads: {
        processed: leadResults.length,
        synced: leadsSynced,
        failed: leadResults.length - leadsSynced,
      },
      details: {
        subscribers: subscriberResults,
        leads: leadResults,
      },
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('❌ CRM sync error:', error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Support GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}

