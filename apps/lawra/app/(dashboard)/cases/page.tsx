'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TableSkeleton } from '@/components/ui/skeletons'
import { caseTypeLabels, caseStatusLabels, priorityLabels } from '@/lib/schemas/case'
import {
  Plus,
  Search,
  FolderOpen,
  Calendar,
  AlertTriangle,
  Briefcase,
  Scale,
} from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

// Status badge variants
const statusVariants: Record<string, 'success' | 'secondary' | 'warning' | 'outline' | 'destructive' | 'info'> = {
  DRAFT: 'secondary',
  ACTIVE: 'success',
  PENDING: 'warning',
  ON_HOLD: 'outline',
  CLOSED: 'secondary',
  WON: 'success',
  LOST: 'destructive',
  SETTLED: 'info',
}

const priorityColors: Record<string, string> = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-amber-500',
  URGENT: 'text-red-500',
}

export default function CasesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const clientId = searchParams.get('clientId')

  // Fetch cases
  const { data, isLoading, error } = useQuery({
    queryKey: ['cases', { search, status: statusFilter, type: typeFilter, clientId }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (clientId) params.set('clientId', clientId)

      const res = await fetch(`/api/cases?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch cases')
      return res.json()
    },
  })

  const getClientInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6 animate-fade-in-up">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                <Briefcase className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-l from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                תיקים
              </h1>
            </div>
            <p className="text-muted-foreground">
              ניהול כל התיקים והעניינים המשפטיים
            </p>
          </div>

          <Button
            onClick={() => router.push('/cases/new')}
            className="bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="me-2 h-4 w-4" />
            תיק חדש
          </Button>
        </div>
      </div>

      {/* Filters with glass effect */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי כותרת, מספר תיק או צד שכנגד..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10 bg-background/50 backdrop-blur-sm border-muted/50 focus:border-emerald-500/50 transition-colors"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-background/50 backdrop-blur-sm border-muted/50">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            {Object.entries(caseStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px] bg-background/50 backdrop-blur-sm border-muted/50">
            <SelectValue placeholder="סוג" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסוגים</SelectItem>
            {Object.entries(caseTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table with premium styling */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-destructive/60" />
            </div>
            <p>שגיאה בטעינת התיקים</p>
          </div>
        ) : data?.cases?.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                <Scale className="h-10 w-10 text-emerald-500/60" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">אין תיקים עדיין</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              התחל לפתוח תיקים חדשים לניהול העניינים המשפטיים שלך
            </p>
            <Button
              onClick={() => router.push('/cases/new')}
              className="bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              <Plus className="me-2 h-4 w-4" />
              פתח תיק ראשון
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">תיק</TableHead>
                <TableHead className="font-semibold">לקוח</TableHead>
                <TableHead className="font-semibold">סוג</TableHead>
                <TableHead className="font-semibold">מועד אחרון</TableHead>
                <TableHead className="font-semibold">סטטוס</TableHead>
                <TableHead className="font-semibold">עדיפות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.cases?.map((caseItem: any, index: number) => (
                <TableRow
                  key={caseItem.id}
                  className="cursor-pointer group transition-all duration-200 hover:bg-emerald-500/5 animate-fade-in-up"
                  style={{ animationDelay: `${0.05 * index}s` }}
                  onClick={() => router.push(`/cases/${caseItem.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-colors">
                        <FolderOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {caseItem.title}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {caseItem.caseNumber && (
                            <span dir="ltr">{caseItem.caseNumber}</span>
                          )}
                          {caseItem.internalReference && (
                            <>
                              {caseItem.caseNumber && <span>•</span>}
                              <span dir="ltr">{caseItem.internalReference}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-emerald-500/30 transition-all">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300">
                          {getClientInitials(caseItem.client?.name || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {caseItem.client?.name}
                        </div>
                        {caseItem.opposingParty && (
                          <div className="text-xs text-muted-foreground">
                            נגד: {caseItem.opposingParty}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground">
                      {caseTypeLabels[caseItem.caseType]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {caseItem.deadline ? (
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-muted/50">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-sm">
                          {format(new Date(caseItem.deadline), 'dd/MM/yyyy', { locale: he })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariants[caseItem.status] || 'outline'}
                      className="font-medium"
                    >
                      {caseStatusLabels[caseItem.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1.5 ${priorityColors[caseItem.priority]}`}>
                      {caseItem.priority === 'URGENT' && (
                        <AlertTriangle className="h-4 w-4 animate-pulse" />
                      )}
                      <span className="text-sm font-medium">
                        {priorityLabels[caseItem.priority]}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination info */}
      {data?.pagination && (
        <div className="text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          מציג {data.cases.length} מתוך {data.pagination.total} תיקים
        </div>
      )}
    </div>
  )
}
