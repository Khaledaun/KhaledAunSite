import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Mail, 
  MousePointerClick, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getMarketingStats() {
  try {
    // Get subscriber stats
    const totalSubscribers = await prisma.newsletterSubscriber.count();
    const confirmedSubscribers = await prisma.newsletterSubscriber.count({
      where: { status: 'confirmed' }
    });
    const pendingSubscribers = await prisma.newsletterSubscriber.count({
      where: { status: 'pending' }
    });

    // Get campaign stats
    const totalCampaigns = await prisma.emailCampaign.count();
    const sentCampaigns = await prisma.emailCampaign.count({
      where: { status: 'sent' }
    });

    // Get aggregated email metrics
    const campaignMetrics = await prisma.emailCampaign.aggregate({
      _sum: {
        totalSent: true,
        totalDelivered: true,
        totalOpens: true,
        totalClicks: true,
        totalBounces: true,
        totalUnsubscribes: true,
      }
    });

    // Calculate rates
    const delivered = campaignMetrics._sum.totalDelivered || 0;
    const opens = campaignMetrics._sum.totalOpens || 0;
    const clicks = campaignMetrics._sum.totalClicks || 0;
    const bounces = campaignMetrics._sum.totalBounces || 0;

    const openRate = delivered > 0 ? ((opens / delivered) * 100).toFixed(1) : '0.0';
    const clickRate = delivered > 0 ? ((clicks / delivered) * 100).toFixed(1) : '0.0';
    const bounceRate = delivered > 0 ? ((bounces / delivered) * 100).toFixed(1) : '0.0';
    const confirmRate = totalSubscribers > 0 ? ((confirmedSubscribers / totalSubscribers) * 100).toFixed(1) : '0.0';

    // Get recent subscribers
    const recentSubscribers = await prisma.newsletterSubscriber.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        source: true,
        createdAt: true,
        confirmedAt: true,
      }
    });

    // Get recent campaigns
    const recentCampaigns = await prisma.emailCampaign.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        subject: true,
        status: true,
        sentAt: true,
        totalRecipients: true,
        totalSent: true,
        totalOpens: true,
        totalClicks: true,
        createdAt: true,
      }
    });

    // Get recent CRM leads
    const recentLeads = await prisma.crmLead.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        leadStatus: true,
        source: true,
        createdAt: true,
        hubspotSyncStatus: true,
      }
    });

    return {
      subscribers: {
        total: totalSubscribers,
        confirmed: confirmedSubscribers,
        pending: pendingSubscribers,
        confirmRate,
      },
      campaigns: {
        total: totalCampaigns,
        sent: sentCampaigns,
      },
      metrics: {
        sent: campaignMetrics._sum.totalSent || 0,
        delivered,
        opens,
        clicks,
        bounces,
        unsubscribes: campaignMetrics._sum.totalUnsubscribes || 0,
        openRate,
        clickRate,
        bounceRate,
      },
      recent: {
        subscribers: recentSubscribers,
        campaigns: recentCampaigns,
        leads: recentLeads,
      }
    };
  } catch (error) {
    console.error('Error fetching marketing stats:', error);
    return null;
  }
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: any; 
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default async function MarketingDashboard() {
  const stats = await getMarketingStats();

  if (!stats) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load marketing statistics. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Marketing Dashboard</h2>
        <div className="flex items-center space-x-2">
          <a
            href="/marketing/campaigns/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Create Campaign
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Subscribers"
          value={stats.subscribers.total}
          subtitle={`${stats.subscribers.confirmed} confirmed (${stats.subscribers.confirmRate}%)`}
          icon={Users}
        />
        <StatCard
          title="Email Campaigns"
          value={stats.campaigns.total}
          subtitle={`${stats.campaigns.sent} sent`}
          icon={Mail}
        />
        <StatCard
          title="Open Rate"
          value={`${stats.metrics.openRate}%`}
          subtitle={`${stats.metrics.opens} opens`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Click Rate"
          value={`${stats.metrics.clickRate}%`}
          subtitle={`${stats.metrics.clicks} clicks`}
          icon={MousePointerClick}
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Emails Delivered"
          value={stats.metrics.delivered}
          subtitle={`${stats.metrics.sent} sent`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Bounce Rate"
          value={`${stats.metrics.bounceRate}%`}
          subtitle={`${stats.metrics.bounces} bounced`}
          icon={AlertCircle}
        />
        <StatCard
          title="Unsubscribes"
          value={stats.metrics.unsubscribes}
          icon={XCircle}
        />
        <StatCard
          title="Pending Confirmations"
          value={stats.subscribers.pending}
          icon={AlertCircle}
        />
      </div>

      {/* Recent Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Subscribers */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Subscribers</CardTitle>
            <CardDescription>Latest newsletter sign-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent.subscribers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No subscribers yet</p>
              ) : (
                stats.recent.subscribers.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">
                        {sub.firstName || sub.lastName 
                          ? `${sub.firstName || ''} ${sub.lastName || ''}`.trim()
                          : sub.email
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sub.firstName || sub.lastName ? sub.email : sub.source}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        sub.status === 'confirmed' 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Latest email campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent.campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No campaigns yet</p>
              ) : (
                stats.recent.campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.totalRecipients} recipients
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        campaign.status === 'sent' 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : campaign.status === 'scheduled'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {campaign.status}
                      </span>
                      {campaign.totalOpens > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {campaign.totalOpens} opens, {campaign.totalClicks} clicks
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent CRM Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>Latest contact form submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recent.leads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads yet</p>
            ) : (
              stats.recent.leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">
                      {lead.firstName || lead.lastName 
                        ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim()
                        : lead.email
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lead.company || lead.source} • {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      lead.leadStatus === 'new' 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : lead.leadStatus === 'contacted'
                        ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {lead.leadStatus}
                    </span>
                    {lead.hubspotSyncStatus === 'synced' && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

