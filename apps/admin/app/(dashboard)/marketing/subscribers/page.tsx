import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, XCircle, Download, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getSubscribers(searchParams: { 
  status?: string; 
  search?: string; 
  page?: string;
}) {
  try {
    const page = parseInt(searchParams.page || '1');
    const limit = 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (searchParams.status && searchParams.status !== 'all') {
      where.status = searchParams.status;
    }

    if (searchParams.search) {
      where.OR = [
        { email: { contains: searchParams.search, mode: 'insensitive' } },
        { firstName: { contains: searchParams.search, mode: 'insensitive' } },
        { lastName: { contains: searchParams.search, mode: 'insensitive' } },
      ];
    }

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    const statusCounts = await prisma.newsletterSubscriber.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      subscribers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      statusCounts: Object.fromEntries(
        statusCounts.map(s => [s.status, s._count])
      ),
    };
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return null;
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    confirmed: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    unsubscribed: 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
    bounced: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
      {status}
    </span>
  );
}

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; page?: string };
}) {
  const data = await getSubscribers(searchParams);

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-red-600">Failed to load subscribers. Please try again later.</p>
      </div>
    );
  }

  const { subscribers, total, page, totalPages, statusCounts } = data;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscribers</h2>
          <p className="text-muted-foreground">
            Manage your {total.toLocaleString()} newsletter subscribers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <a
            href="/api/marketing/subscribers/export?format=csv"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex space-x-2 border-b">
        <Link
          href="/marketing/subscribers"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            !searchParams.status || searchParams.status === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({total})
        </Link>
        <Link
          href="/marketing/subscribers?status=confirmed"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            searchParams.status === 'confirmed'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckCircle2 className="inline mr-1 h-4 w-4" />
          Confirmed ({statusCounts.confirmed || 0})
        </Link>
        <Link
          href="/marketing/subscribers?status=pending"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            searchParams.status === 'pending'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="inline mr-1 h-4 w-4" />
          Pending ({statusCounts.pending || 0})
        </Link>
        <Link
          href="/marketing/subscribers?status=unsubscribed"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            searchParams.status === 'unsubscribed'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <XCircle className="inline mr-1 h-4 w-4" />
          Unsubscribed ({statusCounts.unsubscribed || 0})
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form action="/marketing/subscribers" method="get" className="flex gap-2">
            {searchParams.status && (
              <input type="hidden" name="status" value={searchParams.status} />
            )}
            <input
              type="search"
              name="search"
              placeholder="Search by email or name..."
              defaultValue={searchParams.search}
              className="flex-1 px-4 py-2 border border-input rounded-md bg-background"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Search
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers</CardTitle>
          <CardDescription>
            Page {page} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Source</th>
                  <th className="pb-3 font-medium">Subscribed</th>
                  <th className="pb-3 font-medium">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{sub.email}</span>
                          {sub.hubspotContactId && (
                            <span className="text-xs text-muted-foreground">
                              HubSpot: {sub.hubspotContactId.slice(0, 8)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        {sub.firstName || sub.lastName
                          ? `${sub.firstName || ''} ${sub.lastName || ''}`.trim()
                          : '-'}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {sub.source || '-'}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col text-xs text-muted-foreground">
                          <span>{sub.totalOpens} opens</span>
                          <span>{sub.totalClicks} clicks</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, total)} of {total} subscribers
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/marketing/subscribers?${new URLSearchParams({
                      ...(searchParams.status && { status: searchParams.status }),
                      ...(searchParams.search && { search: searchParams.search }),
                      page: (page - 1).toString(),
                    })}`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/marketing/subscribers?${new URLSearchParams({
                      ...(searchParams.status && { status: searchParams.status }),
                      ...(searchParams.search && { search: searchParams.search }),
                      page: (page + 1).toString(),
                    })}`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

