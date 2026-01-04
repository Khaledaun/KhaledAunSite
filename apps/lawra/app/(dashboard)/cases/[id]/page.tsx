'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import {
  caseTypeLabels,
  caseStatusLabels,
  priorityLabels,
  feeTypeLabels,
  practiceAreaLabels,
} from '@/lib/schemas/case'
import {
  ArrowRight,
  Edit2,
  FolderOpen,
  User,
  Calendar,
  Clock,
  FileText,
  CheckSquare,
  AlertTriangle,
  Building2,
  Scale,
  DollarSign,
  Plus,
  Phone,
  Mail,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

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
  LOW: 'text-gray-500 bg-gray-100',
  MEDIUM: 'text-blue-600 bg-blue-100',
  HIGH: 'text-amber-600 bg-amber-100',
  URGENT: 'text-red-600 bg-red-100',
}

const taskStatusLabels: Record<string, string> = {
  INBOX: 'תיבת דואר',
  TODO: 'לביצוע',
  IN_PROGRESS: 'בעבודה',
  REVIEW: 'לבדיקה',
  DONE: 'הושלם',
  CANCELLED: 'בוטל',
}

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const caseId = params.id as string

  // Fetch case
  const { data: caseData, isLoading, error } = useQuery({
    queryKey: ['case', caseId],
    queryFn: async () => {
      const res = await fetch(`/api/cases/${caseId}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('תיק לא נמצא')
        throw new Error('Failed to fetch case')
      }
      return res.json()
    },
    enabled: !!caseId,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete case')
      return res.json()
    },
    onSuccess: () => {
      toast({
        title: 'התיק נמחק בהצלחה',
      })
      router.push('/cases')
    },
    onError: () => {
      toast({
        title: 'שגיאה במחיקת התיק',
        variant: 'destructive',
      })
    },
  })

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} דק'`
    if (mins === 0) return `${hours} שעות`
    return `${hours}:${mins.toString().padStart(2, '0')} שעות`
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">תיק לא נמצא</h2>
        <p className="text-muted-foreground">התיק המבוקש אינו קיים במערכת</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/cases')}
        >
          <ArrowRight className="me-2 h-4 w-4" />
          חזרה לרשימת התיקים
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/cases')}>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="p-3 rounded-xl bg-primary/10">
            <FolderOpen className="h-8 w-8 text-primary" />
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{caseData.title}</h1>
              <Badge variant={statusVariants[caseData.status]}>
                {caseStatusLabels[caseData.status]}
              </Badge>
              <div className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[caseData.priority]}`}>
                {caseData.priority === 'URGENT' && <AlertTriangle className="h-3 w-3 inline me-1" />}
                {priorityLabels[caseData.priority]}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1 text-muted-foreground text-sm">
              {caseData.caseNumber && <span dir="ltr">{caseData.caseNumber}</span>}
              {caseData.caseNumber && caseData.internalReference && <span>•</span>}
              {caseData.internalReference && <span dir="ltr">{caseData.internalReference}</span>}
              <span>•</span>
              <span>{caseTypeLabels[caseData.caseType]}</span>
              {caseData.practiceArea && (
                <>
                  <span>•</span>
                  <span>{practiceAreaLabels[caseData.practiceArea]}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ms-12 lg:ms-0">
          <Button variant="outline" onClick={() => router.push(`/cases/${caseId}/edit`)}>
            <Edit2 className="me-2 h-4 w-4" />
            עריכה
          </Button>
          <Button onClick={() => router.push(`/tasks?caseId=${caseId}`)}>
            <Plus className="me-2 h-4 w-4" />
            משימה חדשה
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>לקוח</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/clients/${caseData.client.id}`)}
              >
                צפה בלקוח
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(caseData.client.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{caseData.client.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                    {caseData.client.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span dir="ltr">{caseData.client.phone}</span>
                      </div>
                    )}
                    {caseData.client.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span dir="ltr">{caseData.client.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Court & Opposing Party */}
          {(caseData.court || caseData.opposingParty) && (
            <Card>
              <CardHeader>
                <CardTitle>פרטי בית משפט</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseData.court && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">בית משפט</p>
                      <p className="font-medium">{caseData.court}</p>
                    </div>
                  </div>
                )}
                {caseData.judge && (
                  <div className="flex items-start gap-3">
                    <Scale className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">שופט</p>
                      <p className="font-medium">{caseData.judge}</p>
                    </div>
                  </div>
                )}
                {caseData.opposingParty && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">צד שכנגד</p>
                      <p className="font-medium">{caseData.opposingParty}</p>
                    </div>
                  </div>
                )}
                {caseData.opposingCounsel && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">ב"כ צד שכנגד</p>
                      <p className="font-medium">{caseData.opposingCounsel}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>משימות</CardTitle>
              <Button size="sm" onClick={() => router.push(`/tasks?caseId=${caseId}`)}>
                <Plus className="me-2 h-4 w-4" />
                הוסף
              </Button>
            </CardHeader>
            <CardContent>
              {caseData.tasks?.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckSquare className="mx-auto h-8 w-8 opacity-50" />
                  <p className="mt-2">אין משימות עבור תיק זה</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {caseData.tasks?.map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/tasks?taskId=${task.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        <span className={task.status === 'DONE' ? 'line-through text-muted-foreground' : ''}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(task.dueDate), 'dd/MM', { locale: he })}
                          </span>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {taskStatusLabels[task.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {caseData.description && (
            <Card>
              <CardHeader>
                <CardTitle>תיאור</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{caseData.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>סיכום</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {caseData._count?.tasks || 0}
                </div>
                <div className="text-sm text-muted-foreground">משימות</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {caseData._count?.documents || 0}
                </div>
                <div className="text-sm text-muted-foreground">מסמכים</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {formatDuration(caseData.totalMinutes || 0)}
                </div>
                <div className="text-sm text-muted-foreground">זמן עבודה</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {caseData._count?.calendarEvents || 0}
                </div>
                <div className="text-sm text-muted-foreground">אירועים</div>
              </div>
            </CardContent>
          </Card>

          {/* Financial */}
          <Card>
            <CardHeader>
              <CardTitle>פרטי שכ"ט</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">סוג שכ"ט</span>
                <span className="font-medium">{feeTypeLabels[caseData.feeType]}</span>
              </div>
              {caseData.feeAmount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">סכום</span>
                  <span className="font-medium" dir="ltr">₪{caseData.feeAmount.toLocaleString()}</span>
                </div>
              )}
              {caseData.retainerAmount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">מקדמה</span>
                  <span className="font-medium" dir="ltr">₪{caseData.retainerAmount.toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>תאריכים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseData.openedDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">תאריך פתיחה</span>
                  <span className="font-medium">
                    {format(new Date(caseData.openedDate), 'dd/MM/yyyy', { locale: he })}
                  </span>
                </div>
              )}
              {caseData.deadline && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">מועד יעד</span>
                  <span className="font-medium">
                    {format(new Date(caseData.deadline), 'dd/MM/yyyy', { locale: he })}
                  </span>
                </div>
              )}
              {caseData.nextHearing && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">דיון הבא</span>
                  <span className="font-medium">
                    {format(new Date(caseData.nextHearing), 'dd/MM/yyyy HH:mm', { locale: he })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          {caseData.calendarEvents?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>אירועים קרובים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {caseData.calendarEvents.map((event: any) => (
                  <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.startTime), 'dd/MM HH:mm', { locale: he })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {caseData.notes && (
            <Card>
              <CardHeader>
                <CardTitle>הערות</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{caseData.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">אזור מסוכן</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  if (confirm('האם אתה בטוח שברצונך למחוק את התיק? פעולה זו אינה ניתנת לביטול.')) {
                    deleteMutation.mutate()
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="me-2 h-4 w-4" />
                מחק תיק
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
