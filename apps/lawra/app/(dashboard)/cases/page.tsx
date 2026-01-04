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
import { caseTypeLabels, caseStatusLabels, priorityLabels } from '@/lib/schemas/case'
import {
  Plus,
  Search,
  FolderOpen,
  Calendar,
  AlertTriangle,
  Loader2,
  User,
  Building2,
  FileText,
  Clock,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">תיקים</h1>
          <p className="text-muted-foreground">
            ניהול כל התיקים והעניינים המשפטיים
          </p>
        </div>

        <Button onClick={() => router.push('/cases/new')}>
          <Plus className="me-2 h-4 w-4" />
          תיק חדש
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי כותרת, מספר תיק או צד שכנגד..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
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
          <SelectTrigger className="w-[150px]">
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

      {/* Table */}
      <div className="rounded-xl border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            שגיאה בטעינת התיקים
          </div>
        ) : data?.cases?.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">אין תיקים</h3>
            <p className="text-muted-foreground">
              התחל להוסיף תיקים חדשים למערכת
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push('/cases/new')}
            >
              <Plus className="me-2 h-4 w-4" />
              צור תיק ראשון
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>תיק</TableHead>
                <TableHead>לקוח</TableHead>
                <TableHead>סוג</TableHead>
                <TableHead>מועד אחרון</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>עדיפות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.cases?.map((caseItem: any) => (
                <TableRow
                  key={caseItem.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/cases/${caseItem.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FolderOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{caseItem.title}</div>
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
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-muted">
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
                    <span className="text-sm">
                      {caseTypeLabels[caseItem.caseType]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {caseItem.deadline ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(caseItem.deadline), 'dd/MM/yyyy', { locale: he })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[caseItem.status] || 'outline'}>
                      {caseStatusLabels[caseItem.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 ${priorityColors[caseItem.priority]}`}>
                      {caseItem.priority === 'URGENT' && (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      <span className="text-sm">
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
        <div className="text-sm text-muted-foreground">
          מציג {data.cases.length} מתוך {data.pagination.total} תיקים
        </div>
      )}
    </div>
  )
}
