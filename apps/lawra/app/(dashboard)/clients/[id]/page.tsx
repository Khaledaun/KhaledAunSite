'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientForm } from '@/components/clients/client-form'
import { useToast } from '@/components/ui/use-toast'
import { clientTypeLabels, clientStatusLabels, type CreateClientInput } from '@/lib/schemas/client'
import {
  ArrowRight,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  FolderOpen,
  Clock,
  FileText,
  Plus,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'

const statusVariants: Record<string, 'success' | 'secondary' | 'warning' | 'outline'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  POTENTIAL: 'warning',
  ARCHIVED: 'outline',
}

const caseStatusLabels: Record<string, string> = {
  DRAFT: 'טיוטה',
  ACTIVE: 'פעיל',
  PENDING: 'ממתין',
  ON_HOLD: 'מוקפא',
  CLOSED: 'סגור',
  WON: 'ניצחון',
  LOST: 'הפסד',
  SETTLED: 'פשרה',
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const clientId = params.id as string

  // Fetch client
  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${clientId}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('לקוח לא נמצא')
        throw new Error('Failed to fetch client')
      }
      return res.json()
    },
    enabled: !!clientId,
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CreateClientInput) => {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update client')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] })
      setIsEditDialogOpen(false)
      toast({
        title: 'הלקוח עודכן בהצלחה',
      })
    },
    onError: () => {
      toast({
        title: 'שגיאה בעדכון הלקוח',
        variant: 'destructive',
      })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete client')
      return res.json()
    },
    onSuccess: () => {
      toast({
        title: 'הלקוח נמחק בהצלחה',
      })
      router.push('/clients')
    },
    onError: () => {
      toast({
        title: 'שגיאה במחיקת הלקוח',
        variant: 'destructive',
      })
    },
  })

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
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <User className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">לקוח לא נמצא</h2>
        <p className="text-muted-foreground">הלקוח המבוקש אינו קיים במערכת</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/clients')}
        >
          <ArrowRight className="me-2 h-4 w-4" />
          חזרה לרשימת הלקוחות
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/clients')}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <Badge variant={statusVariants[client.status]}>
                {clientStatusLabels[client.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {client.clientType === 'COMPANY' ? (
                <Building2 className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span>{clientTypeLabels[client.clientType]}</span>
              {client.idNumber && (
                <>
                  <span>•</span>
                  <span dir="ltr">{client.idNumber}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit2 className="me-2 h-4 w-4" />
            עריכה
          </Button>
          <Button onClick={() => router.push(`/cases/new?clientId=${clientId}`)}>
            <Plus className="me-2 h-4 w-4" />
            תיק חדש
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>פרטי קשר</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">טלפון</p>
                    <p className="font-medium" dir="ltr">{client.phone}</p>
                  </div>
                </div>
              )}
              {client.phoneSecondary && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">טלפון נוסף</p>
                    <p className="font-medium" dir="ltr">{client.phoneSecondary}</p>
                  </div>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">דוא"ל</p>
                    <p className="font-medium" dir="ltr">{client.email}</p>
                  </div>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">כתובת</p>
                    <p className="font-medium">{client.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cases */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>תיקים</CardTitle>
              <Button size="sm" onClick={() => router.push(`/cases/new?clientId=${clientId}`)}>
                <Plus className="me-2 h-4 w-4" />
                תיק חדש
              </Button>
            </CardHeader>
            <CardContent>
              {client.cases?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="mx-auto h-8 w-8 opacity-50" />
                  <p className="mt-2">אין תיקים עבור לקוח זה</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {client.cases?.map((c: any) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/cases/${c.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{c.title}</p>
                          {c.caseNumber && (
                            <p className="text-sm text-muted-foreground" dir="ltr">
                              {c.caseNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {caseStatusLabels[c.status] || c.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
                  {client._count?.cases || 0}
                </div>
                <div className="text-sm text-muted-foreground">תיקים</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {client._count?.tasks || 0}
                </div>
                <div className="text-sm text-muted-foreground">משימות</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {client._count?.timeEntries || 0}
                </div>
                <div className="text-sm text-muted-foreground">רישומי זמן</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {client._count?.invoices || 0}
                </div>
                <div className="text-sm text-muted-foreground">חשבוניות</div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Info */}
          <Card>
            <CardHeader>
              <CardTitle>מידע פיננסי</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">תעריף שעתי</span>
                <span className="font-medium" dir="ltr">
                  {client.billingRate ? `₪${client.billingRate}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">תנאי תשלום</span>
                <span className="font-medium">
                  {client.paymentTerms === 0 ? 'מיידי' : `שוטף + ${client.paymentTerms}`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>הערות</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
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
                  if (confirm('האם אתה בטוח שברצונך למחוק את הלקוח? פעולה זו אינה ניתנת לביטול.')) {
                    deleteMutation.mutate()
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="me-2 h-4 w-4" />
                מחק לקוח
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>עריכת לקוח</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSubmit={updateMutation.mutateAsync}
            defaultValues={{
              name: client.name,
              clientType: client.clientType,
              idNumber: client.idNumber,
              email: client.email,
              phone: client.phone,
              phoneSecondary: client.phoneSecondary,
              address: client.address,
              billingRate: client.billingRate ? parseFloat(client.billingRate) : undefined,
              paymentTerms: client.paymentTerms,
              notes: client.notes,
              status: client.status,
            }}
            isLoading={updateMutation.isPending}
            submitLabel="שמור שינויים"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
