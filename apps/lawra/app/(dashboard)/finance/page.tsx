'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { TimeEntryForm } from '@/components/finance/time-entry-form'
import {
  formatDuration,
  activityTypeLabels,
  type ActivityType,
} from '@/lib/schemas/time-entry'
import {
  invoiceStatusLabels,
  invoiceStatusColors,
  formatCurrency,
  type InvoiceStatus,
} from '@/lib/schemas/invoice'
import {
  Plus,
  Search,
  Clock,
  Receipt,
  MoreHorizontal,
  Trash2,
  Loader2,
  FolderOpen,
  Users,
  Calendar,
  TrendingUp,
  FileText,
} from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

export default function FinancePage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [isAddTimeEntryOpen, setIsAddTimeEntryOpen] = useState(false)
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null)
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null)
  const [timeEntrySearch, setTimeEntrySearch] = useState('')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('all')

  // Fetch time entries
  const { data: timeEntriesData, isLoading: timeEntriesLoading } = useQuery({
    queryKey: ['time-entries'],
    queryFn: async () => {
      const res = await fetch('/api/time-entries?limit=50')
      if (!res.ok) throw new Error('Failed to fetch time entries')
      return res.json()
    },
  })

  // Fetch invoices
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', { status: invoiceStatusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (invoiceStatusFilter !== 'all') {
        params.set('status', invoiceStatusFilter)
      }
      const res = await fetch(`/api/invoices?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch invoices')
      return res.json()
    },
  })

  // Delete time entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/time-entries/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete time entry')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      toast({ title: 'רישום הזמן נמחק בהצלחה' })
      setDeleteEntryId(null)
    },
    onError: () => {
      toast({
        title: 'שגיאה במחיקת רישום הזמן',
        variant: 'destructive',
      })
    },
  })

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete invoice')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({ title: 'החשבונית נמחקה בהצלחה' })
      setDeleteInvoiceId(null)
    },
    onError: () => {
      toast({
        title: 'שגיאה במחיקת החשבונית',
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">כספים וחיובים</h1>
          <p className="text-muted-foreground">
            ניהול רישום זמן, חיובים וחשבוניות
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">שעות החודש</p>
              <p className="text-2xl font-bold" dir="ltr">
                {formatDuration(timeEntriesData?.totalMinutes || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">שעות לחיוב</p>
              <p className="text-2xl font-bold" dir="ltr">
                {formatDuration(timeEntriesData?.billableMinutes || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">סה״כ חשבוניות</p>
              <p className="text-2xl font-bold">
                {formatCurrency(Number(invoicesData?.totalAmount) || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">שולם</p>
              <p className="text-2xl font-bold">
                {formatCurrency(Number(invoicesData?.paidAmount) || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="time-entries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="time-entries" className="gap-2">
            <Clock className="h-4 w-4" />
            רישום זמן
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <Receipt className="h-4 w-4" />
            חשבוניות
          </TabsTrigger>
        </TabsList>

        {/* Time Entries Tab */}
        <TabsContent value="time-entries" className="space-y-4">
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי תיאור..."
                value={timeEntrySearch}
                onChange={(e) => setTimeEntrySearch(e.target.value)}
                className="ps-10"
              />
            </div>

            <Dialog open={isAddTimeEntryOpen} onOpenChange={setIsAddTimeEntryOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="me-2 h-4 w-4" />
                  רישום זמן חדש
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>רישום זמן חדש</DialogTitle>
                </DialogHeader>
                <TimeEntryForm
                  onSuccess={() => setIsAddTimeEntryOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Time Entries Table */}
          <div className="rounded-xl border bg-card">
            {timeEntriesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : timeEntriesData?.timeEntries?.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">אין רישומי זמן</h3>
                <p className="text-muted-foreground">
                  התחל לרשום זמן עבודה
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>תאריך</TableHead>
                    <TableHead>תיאור</TableHead>
                    <TableHead>תיק / לקוח</TableHead>
                    <TableHead>סוג</TableHead>
                    <TableHead>משך</TableHead>
                    <TableHead>חיוב</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntriesData?.timeEntries?.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span dir="ltr">
                            {format(new Date(entry.date), 'dd/MM/yyyy', { locale: he })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="font-medium line-clamp-1">
                            {entry.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.case ? (
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="line-clamp-1">{entry.case.title}</span>
                          </div>
                        ) : entry.client ? (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="line-clamp-1">{entry.client.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.activityType ? (
                          <Badge variant="secondary">
                            {activityTypeLabels[entry.activityType as ActivityType]}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono" dir="ltr">
                          {formatDuration(entry.durationMinutes)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {entry.isBillable ? (
                          <Badge variant="outline" className="text-green-600">
                            לחיוב
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-400">
                            לא לחיוב
                          </Badge>
                        )}
                        {entry.invoice && (
                          <Badge variant="secondary" className="ms-1">
                            חויב
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteEntryId(entry.id)}
                              disabled={!!entry.invoiceId}
                            >
                              <Trash2 className="me-2 h-4 w-4" />
                              מחיקה
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                {Object.entries(invoiceStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <Button variant="outline">
              <Plus className="me-2 h-4 w-4" />
              חשבונית חדשה
            </Button>
          </div>

          {/* Invoices Table */}
          <div className="rounded-xl border bg-card">
            {invoicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : invoicesData?.invoices?.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">אין חשבוניות</h3>
                <p className="text-muted-foreground">
                  צור חשבונית ראשונה
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>מספר חשבונית</TableHead>
                    <TableHead>לקוח</TableHead>
                    <TableHead>תאריך</TableHead>
                    <TableHead>סכום</TableHead>
                    <TableHead>שולם</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesData?.invoices?.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <span className="font-mono" dir="ltr">
                          {invoice.invoiceNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {invoice.client?.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span dir="ltr">
                          {format(new Date(invoice.issueDate), 'dd/MM/yyyy', { locale: he })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {formatCurrency(Number(invoice.total))}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(invoice.paidAmount))}
                      </TableCell>
                      <TableCell>
                        <Badge className={invoiceStatusColors[invoice.status as InvoiceStatus]}>
                          {invoiceStatusLabels[invoice.status as InvoiceStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteInvoiceId(invoice.id)}
                              disabled={invoice.status !== 'DRAFT'}
                            >
                              <Trash2 className="me-2 h-4 w-4" />
                              מחיקה
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Time Entry Confirmation */}
      <AlertDialog open={!!deleteEntryId} onOpenChange={() => setDeleteEntryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את רישום הזמן לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteEntryId && deleteEntryMutation.mutate(deleteEntryId)}
            >
              {deleteEntryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'מחק'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Invoice Confirmation */}
      <AlertDialog open={!!deleteInvoiceId} onOpenChange={() => setDeleteInvoiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את החשבונית לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteInvoiceId && deleteInvoiceMutation.mutate(deleteInvoiceId)}
            >
              {deleteInvoiceMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'מחק'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
