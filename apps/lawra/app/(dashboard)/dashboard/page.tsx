'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  FolderOpen,
  Users,
  CheckSquare,
  Clock,
  Calendar,
  TrendingUp,
  FileText,
  Scale,
  ChevronLeft,
  ArrowUpRight,
  Bell,
  Brain,
  Sparkles,
  Receipt,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/schemas/time-entry'
import { format, isToday, isTomorrow, addDays } from 'date-fns'
import { he } from 'date-fns/locale'

// Stats card data
const statCards = [
  {
    title: 'תיקים פעילים',
    icon: FolderOpen,
    gradient: 'apple-gradient-blue',
    href: '/cases',
  },
  {
    title: 'לקוחות',
    icon: Users,
    gradient: 'apple-gradient-green',
    href: '/clients',
  },
  {
    title: 'משימות פתוחות',
    icon: CheckSquare,
    gradient: 'apple-gradient-orange',
    href: '/tasks',
  },
  {
    title: 'שעות החודש',
    icon: Clock,
    gradient: 'apple-gradient-purple',
    href: '/finance',
  },
]

export default function DashboardPage() {
  // Fetch stats
  const { data: casesData } = useQuery({
    queryKey: ['dashboard-cases'],
    queryFn: async () => {
      const res = await fetch('/api/cases?limit=5&status=ACTIVE')
      return res.ok ? res.json() : { total: 0, cases: [] }
    },
  })

  const { data: clientsData } = useQuery({
    queryKey: ['dashboard-clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients?limit=5&status=ACTIVE')
      return res.ok ? res.json() : { total: 0, clients: [] }
    },
  })

  const { data: tasksData } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks?limit=5')
      return res.ok ? res.json() : { tasks: [] }
    },
  })

  const { data: timeData } = useQuery({
    queryKey: ['dashboard-time'],
    queryFn: async () => {
      const res = await fetch('/api/time-entries?limit=1')
      return res.ok ? res.json() : { totalMinutes: 0 }
    },
  })

  const { data: eventsData } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: async () => {
      const start = new Date()
      const end = addDays(start, 7)
      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      })
      const res = await fetch(`/api/calendar-events?${params}`)
      return res.ok ? res.json() : { events: [] }
    },
  })

  const stats = [
    { ...statCards[0], value: casesData?.total || 0 },
    { ...statCards[1], value: clientsData?.total || 0 },
    { ...statCards[2], value: tasksData?.tasks?.length || 0 },
    { ...statCards[3], value: formatDuration(timeData?.totalMinutes || 0) },
  ]

  const recentTasks = tasksData?.tasks?.slice(0, 5) || []
  const upcomingEvents = eventsData?.events?.slice(0, 4) || []
  const recentCases = casesData?.cases?.slice(0, 4) || []

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            שלום, עו״ד 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, d בMMMM yyyy', { locale: he })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="rounded-2xl">
            <Bell className="h-5 w-5" />
          </Button>
          <Link href="/legal-mind">
            <Button className="rounded-2xl gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
              <Sparkles className="h-4 w-4" />
              לורה AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link
              key={index}
              href={stat.href}
              className={`apple-stat-card ${stat.gradient} text-white group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-3xl font-bold" dir="ltr">{stat.value}</div>
              <div className="text-white/80 text-sm mt-1">{stat.title}</div>
            </Link>
          )
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Widget */}
        <div className="lg:col-span-2 apple-widget">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="apple-icon apple-gradient-orange text-white">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">משימות להיום</h2>
                <p className="text-sm text-muted-foreground">{recentTasks.length} משימות פתוחות</p>
              </div>
            </div>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="gap-1">
                הכל
                <ChevronLeft className="h-4 w-4 rtl-flip" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>אין משימות פתוחות</p>
              </div>
            ) : (
              recentTasks.map((task: any) => (
                <div key={task.id} className="apple-list-item">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'URGENT' ? 'bg-red-500' :
                    task.priority === 'HIGH' ? 'bg-orange-500' :
                    task.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    {task.case && (
                      <p className="text-sm text-muted-foreground truncate">
                        {task.case.title}
                      </p>
                    )}
                  </div>
                  {task.dueDate && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isToday(new Date(task.dueDate))
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isToday(new Date(task.dueDate))
                        ? 'היום'
                        : format(new Date(task.dueDate), 'dd/MM')}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="apple-widget">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="apple-icon apple-gradient-blue text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">אירועים קרובים</h2>
                <p className="text-sm text-muted-foreground">השבוע הקרוב</p>
              </div>
            </div>
            <Link href="/calendar">
              <Button variant="ghost" size="sm" className="gap-1">
                יומן
                <ChevronLeft className="h-4 w-4 rtl-flip" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>אין אירועים קרובים</p>
              </div>
            ) : (
              upcomingEvents.map((event: any) => (
                <div key={event.id} className="apple-list-item">
                  <div className={`w-2 h-full min-h-[40px] rounded-full ${
                    event.eventType === 'HEARING' ? 'bg-red-500' :
                    event.eventType === 'MEETING' ? 'bg-green-500' :
                    event.eventType === 'DEADLINE' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {isToday(new Date(event.startTime))
                        ? 'היום'
                        : isTomorrow(new Date(event.startTime))
                        ? 'מחר'
                        : format(new Date(event.startTime), 'EEEE', { locale: he })}
                      {!event.allDay && ` · ${format(new Date(event.startTime), 'HH:mm')}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 apple-widget">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="apple-icon apple-gradient-green text-white">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">תיקים אחרונים</h2>
                <p className="text-sm text-muted-foreground">תיקים פעילים</p>
              </div>
            </div>
            <Link href="/cases">
              <Button variant="ghost" size="sm" className="gap-1">
                הכל
                <ChevronLeft className="h-4 w-4 rtl-flip" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentCases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>אין תיקים פעילים</p>
              </div>
            ) : (
              recentCases.map((caseItem: any) => (
                <Link
                  key={caseItem.id}
                  href={`/cases/${caseItem.id}`}
                  className="apple-list-item"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{caseItem.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {caseItem.client?.name || 'ללא לקוח'}
                      {caseItem.caseNumber && ` · ${caseItem.caseNumber}`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    caseItem.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {caseItem.status === 'ACTIVE' ? 'פעיל' : caseItem.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="apple-widget">
          <div className="flex items-center gap-3 mb-6">
            <div className="apple-icon apple-gradient-purple text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">פעולות מהירות</h2>
              <p className="text-sm text-muted-foreground">קיצורי דרך</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/clients?new=true"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:scale-105 transition-transform"
            >
              <Users className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">לקוח חדש</span>
            </Link>

            <Link
              href="/cases/new"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:scale-105 transition-transform"
            >
              <FolderOpen className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">תיק חדש</span>
            </Link>

            <Link
              href="/tasks?new=true"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 hover:scale-105 transition-transform"
            >
              <CheckSquare className="h-6 w-6 text-orange-600" />
              <span className="text-sm font-medium">משימה חדשה</span>
            </Link>

            <Link
              href="/documents/generate"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 hover:scale-105 transition-transform"
            >
              <FileText className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">צור מסמך</span>
            </Link>

            <Link
              href="/finance"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 hover:scale-105 transition-transform col-span-2"
            >
              <Receipt className="h-6 w-6 text-cyan-600" />
              <span className="text-sm font-medium">רישום זמן</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
