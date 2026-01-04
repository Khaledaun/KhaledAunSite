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
    <div className="p-6 lg:p-8 space-y-8 dashboard-bg-enhanced min-h-screen">
      {/* Welcome Header with staggered animation */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text-animated">
            שלום, עו״ד
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {format(new Date(), 'EEEE, d בMMMM yyyy', { locale: he })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-2xl h-12 w-12 glow-hover border-2"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Link href="/legal-mind">
            <Button className="rounded-2xl gap-2 h-12 px-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-purple-500/25 glow-hover animate-float">
              <Sparkles className="h-5 w-5" />
              לורה AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid with staggered entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400']
          return (
            <Link
              key={index}
              href={stat.href}
              className={`apple-stat-card stat-card-shine ${stat.gradient} text-white group animate-fade-in-scale ${delays[index]} card-depth`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-all duration-300" />
              </div>
              <div className="text-4xl font-bold tracking-tight" dir="ltr">{stat.value}</div>
              <div className="text-white/80 text-sm mt-2 font-medium">{stat.title}</div>
            </Link>
          )
        })}
      </div>

      {/* Main Grid with glass widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Widget */}
        <div className="lg:col-span-2 glass-premium p-6 animate-slide-in-right delay-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="apple-icon apple-gradient-orange text-white shadow-lg shadow-orange-500/30">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">משימות להיום</h2>
                <p className="text-sm text-muted-foreground">{recentTasks.length} משימות פתוחות</p>
              </div>
            </div>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="gap-1 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                הכל
                <ChevronLeft className="h-4 w-4 rtl-flip" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 flex items-center justify-center">
                  <CheckSquare className="h-10 w-10 text-orange-400" />
                </div>
                <p className="text-lg font-medium">אין משימות פתוחות</p>
                <p className="text-sm mt-1">כל הכבוד! סיימת את כל המשימות</p>
              </div>
            ) : (
              recentTasks.map((task: any, idx: number) => (
                <div key={task.id} className="apple-list-item list-item-interactive" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className={`w-3 h-3 rounded-full ring-4 ring-opacity-20 ${
                    task.priority === 'URGENT' ? 'bg-red-500 ring-red-500' :
                    task.priority === 'HIGH' ? 'bg-orange-500 ring-orange-500' :
                    task.priority === 'MEDIUM' ? 'bg-blue-500 ring-blue-500' : 'bg-gray-400 ring-gray-400'
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
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      isToday(new Date(task.dueDate))
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
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
        <div className="glass-premium p-6 animate-slide-in-right delay-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="apple-icon apple-gradient-blue text-white shadow-lg shadow-blue-500/30">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">אירועים קרובים</h2>
                <p className="text-sm text-muted-foreground">השבוע הקרוב</p>
              </div>
            </div>
            <Link href="/calendar">
              <Button variant="ghost" size="sm" className="gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                יומן
                <ChevronLeft className="h-4 w-4 rtl-flip" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-lg font-medium">אין אירועים קרובים</p>
                <p className="text-sm mt-1">השבוע שלך פנוי</p>
              </div>
            ) : (
              upcomingEvents.map((event: any, idx: number) => (
                <div key={event.id} className="apple-list-item list-item-interactive" style={{ animationDelay: `${idx * 50}ms` }}>
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
        <div className="lg:col-span-2 glass-premium p-6 animate-fade-in-up delay-400">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="apple-icon apple-gradient-green text-white shadow-lg shadow-green-500/30">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">תיקים אחרונים</h2>
                <p className="text-sm text-muted-foreground">תיקים פעילים</p>
              </div>
            </div>
            <Link href="/cases">
              <Button variant="ghost" size="sm" className="gap-1 hover:bg-green-50 dark:hover:bg-green-900/20">
                הכל
                <ChevronLeft className="h-4 w-4 rtl-flip" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentCases.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center">
                  <FolderOpen className="h-10 w-10 text-green-400" />
                </div>
                <p className="text-lg font-medium">אין תיקים פעילים</p>
                <p className="text-sm mt-1">התחל להוסיף תיקים חדשים</p>
              </div>
            ) : (
              recentCases.map((caseItem: any, idx: number) => (
                <Link
                  key={caseItem.id}
                  href={`/cases/${caseItem.id}`}
                  className="apple-list-item list-item-interactive group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl group-hover:scale-110 transition-transform">
                    <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{caseItem.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {caseItem.client?.name || 'ללא לקוח'}
                      {caseItem.caseNumber && ` · ${caseItem.caseNumber}`}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                    caseItem.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {caseItem.status === 'ACTIVE' ? 'פעיל' : caseItem.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-premium p-6 animate-fade-in-up delay-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="apple-icon apple-gradient-purple text-white shadow-lg shadow-purple-500/30 animate-float">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">פעולות מהירות</h2>
              <p className="text-sm text-muted-foreground">קיצורי דרך</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/clients?new=true"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:scale-105 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group"
            >
              <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium">לקוח חדש</span>
            </Link>

            <Link
              href="/cases/new"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group"
            >
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium">תיק חדש</span>
            </Link>

            <Link
              href="/tasks?new=true"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 group"
            >
              <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 group-hover:scale-110 transition-transform">
                <CheckSquare className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium">משימה חדשה</span>
            </Link>

            <Link
              href="/documents/generate"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group"
            >
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium">צור מסמך</span>
            </Link>

            <Link
              href="/finance"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 col-span-2 group"
            >
              <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 group-hover:scale-110 transition-transform">
                <Receipt className="h-6 w-6 text-cyan-600" />
              </div>
              <span className="text-sm font-medium">רישום זמן</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
