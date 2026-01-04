import { Suspense } from 'react'
import { GeneralUpdates } from '@/components/dashboard/general-updates'
import { ImportantEmails } from '@/components/dashboard/important-emails'
import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks'
import { CalendarWidget } from '@/components/dashboard/calendar-widget'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'דשבורד',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Row - Updates and Emails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<WidgetSkeleton />}>
          <GeneralUpdates />
        </Suspense>

        <Suspense fallback={<WidgetSkeleton />}>
          <ImportantEmails />
        </Suspense>
      </div>

      {/* Bottom Row - Tasks and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<WidgetSkeleton />}>
          <UpcomingTasks />
        </Suspense>

        <Suspense fallback={<WidgetSkeleton />}>
          <CalendarWidget />
        </Suspense>
      </div>
    </div>
  )
}

function WidgetSkeleton() {
  return (
    <div className="lawra-card">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  )
}
