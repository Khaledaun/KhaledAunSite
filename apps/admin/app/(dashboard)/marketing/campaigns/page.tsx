import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, Clock, CheckCircle2, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getCampaigns() {
  try {
    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const stats = await prisma.emailCampaign.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      campaigns,
      statusCounts: Object.fromEntries(stats.map(s => [s.status, s._count])),
    };
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return null;
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    draft: 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
    scheduled: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    sending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    sent: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    failed: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
      {status}
    </span>
  );
}

export default async function CampaignsPage() {
  const data = await getCampaigns();

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-red-600">Failed to load campaigns. Please try again later.</p>
      </div>
    );
  }

  const { campaigns, statusCounts } = data;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Email Campaigns</h2>
          <p className="text-muted-foreground">
            Create and manage your newsletter campaigns
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/marketing/campaigns/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.sent || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.scheduled || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.draft || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            Your email campaign history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Subject</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Recipients</th>
                  <th className="pb-3 font-medium">Opens</th>
                  <th className="pb-3 font-medium">Clicks</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Mail className="h-12 w-12 text-muted-foreground/50" />
                        <p>No campaigns yet</p>
                        <Link
                          href="/marketing/campaigns/new"
                          className="text-primary hover:underline"
                        >
                          Create your first campaign
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => {
                    const openRate = campaign.totalDelivered > 0 
                      ? ((campaign.totalOpens / campaign.totalDelivered) * 100).toFixed(1)
                      : '0.0';
                    const clickRate = campaign.totalDelivered > 0
                      ? ((campaign.totalClicks / campaign.totalDelivered) * 100).toFixed(1)
                      : '0.0';

                    return (
                      <tr key={campaign.id} className="border-b hover:bg-muted/50">
                        <td className="py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{campaign.name}</span>
                            {campaign.tags && campaign.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {(campaign.tags as string[]).slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs px-1.5 py-0.5 bg-muted rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 max-w-xs truncate text-sm text-muted-foreground">
                          {campaign.subject}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={campaign.status} />
                        </td>
                        <td className="py-3 text-sm">
                          {campaign.totalRecipients?.toLocaleString() || 0}
                        </td>
                        <td className="py-3 text-sm">
                          {campaign.totalOpens?.toLocaleString() || 0}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({openRate}%)
                          </span>
                        </td>
                        <td className="py-3 text-sm">
                          {campaign.totalClicks?.toLocaleString() || 0}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({clickRate}%)
                          </span>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Link
                              href={`/marketing/campaigns/${campaign.id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              View
                            </Link>
                            {campaign.status === 'draft' && (
                              <Link
                                href={`/marketing/campaigns/${campaign.id}/edit`}
                                className="text-sm text-primary hover:underline"
                              >
                                Edit
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

