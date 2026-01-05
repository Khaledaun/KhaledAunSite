'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ClientForm } from '@/components/clients/client-form'
import { useToast } from '@/components/ui/use-toast'
import { TableSkeleton } from '@/components/ui/skeletons'
import { clientTypeLabels, clientStatusLabels, type CreateClientInput } from '@/lib/schemas/client'
import {
  Plus,
  Search,
  Building2,
  User,
  Phone,
  Mail,
  MoreHorizontal,
  FolderOpen,
  Sparkles,
  Users,
} from 'lucide-react'

// Status badge variants
const statusVariants: Record<string, 'success' | 'secondary' | 'warning' | 'outline'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  POTENTIAL: 'warning',
  ARCHIVED: 'outline',
}

export default function ClientsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Fetch clients
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', { search, status: statusFilter, type: typeFilter }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)

      const res = await fetch(`/api/clients?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch clients')
      return res.json()
    },
  })

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateClientInput) => {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create client')
      }
      return res.json()
    },
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setIsDialogOpen(false)
      toast({
        title: 'לקוח נוצר בהצלחה',
        description: `הלקוח "${client.name}" נוסף למערכת`,
      })
      router.push(`/clients/${client.id}`)
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה ביצירת לקוח',
        description: error.message,
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

  const getClientIcon = (type: string) => {
    switch (type) {
      case 'COMPANY':
        return <Building2 className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-6 animate-fade-in-up">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
                <Users className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-l from-violet-600 to-purple-600 bg-clip-text text-transparent">
                לקוחות
              </h1>
            </div>
            <p className="text-muted-foreground">
              ניהול כל הלקוחות שלך במקום אחד
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-l from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="me-2 h-4 w-4" />
                לקוח חדש
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-premium border-white/20">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  הוספת לקוח חדש
                </DialogTitle>
                <DialogDescription>
                  מלא את פרטי הלקוח ליצירת כרטיס לקוח חדש
                </DialogDescription>
              </DialogHeader>
              <ClientForm
                onSubmit={createMutation.mutateAsync}
                isLoading={createMutation.isPending}
                submitLabel="צור לקוח"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters with glass effect */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם, אימייל או טלפון..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10 bg-background/50 backdrop-blur-sm border-muted/50 focus:border-violet-500/50 transition-colors"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-background/50 backdrop-blur-sm border-muted/50">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            {Object.entries(clientStatusLabels).map(([value, label]) => (
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
            {Object.entries(clientTypeLabels).map(([value, label]) => (
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
          <TableSkeleton rows={6} columns={5} />
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-destructive/60" />
            </div>
            <p>שגיאה בטעינת הלקוחות</p>
          </div>
        ) : data?.clients?.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center">
                <Users className="h-10 w-10 text-violet-500/60" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">אין לקוחות עדיין</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              התחל להוסיף לקוחות חדשים למערכת כדי לנהל את התיקים והקשרים שלך
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-l from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            >
              <Plus className="me-2 h-4 w-4" />
              הוסף לקוח ראשון
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">לקוח</TableHead>
                <TableHead className="font-semibold">סוג</TableHead>
                <TableHead className="font-semibold">יצירת קשר</TableHead>
                <TableHead className="font-semibold">תיקים</TableHead>
                <TableHead className="font-semibold">סטטוס</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.clients?.map((client: any, index: number) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer group transition-all duration-200 hover:bg-violet-500/5 animate-fade-in-up"
                  style={{ animationDelay: `${0.05 * index}s` }}
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-violet-500/30 transition-all">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-700 dark:text-violet-300 font-medium">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {client.name}
                        </div>
                        {client.idNumber && (
                          <div className="text-sm text-muted-foreground" dir="ltr">
                            {client.idNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {getClientIcon(client.clientType)}
                      <span>{clientTypeLabels[client.clientType]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span dir="ltr" className="text-muted-foreground">{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span dir="ltr" className="text-muted-foreground">{client.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-violet-500/10 transition-colors">
                        <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                      </div>
                      <span className="font-medium">{client._count?.cases || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariants[client.status] || 'outline'}
                      className="font-medium"
                    >
                      {clientStatusLabels[client.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Open actions menu
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
          מציג {data.clients.length} מתוך {data.pagination.total} לקוחות
        </div>
      )}
    </div>
  )
}
