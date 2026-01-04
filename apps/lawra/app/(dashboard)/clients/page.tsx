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
  Loader2,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">לקוחות</h1>
          <p className="text-muted-foreground">
            ניהול כל הלקוחות שלך במקום אחד
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="me-2 h-4 w-4" />
              לקוח חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>הוספת לקוח חדש</DialogTitle>
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם, אימייל או טלפון..."
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
            {Object.entries(clientStatusLabels).map(([value, label]) => (
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
            {Object.entries(clientTypeLabels).map(([value, label]) => (
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
            שגיאה בטעינת הלקוחות
          </div>
        ) : data?.clients?.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">אין לקוחות</h3>
            <p className="text-muted-foreground">
              התחל להוסיף לקוחות חדשים למערכת
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>לקוח</TableHead>
                <TableHead>סוג</TableHead>
                <TableHead>יצירת קשר</TableHead>
                <TableHead>תיקים</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.clients?.map((client: any) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        {client.idNumber && (
                          <div className="text-sm text-muted-foreground" dir="ltr">
                            {client.idNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getClientIcon(client.clientType)}
                      <span>{clientTypeLabels[client.clientType]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span dir="ltr">{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span dir="ltr">{client.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{client._count?.cases || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[client.status] || 'outline'}>
                      {clientStatusLabels[client.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
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
        <div className="text-sm text-muted-foreground">
          מציג {data.clients.length} מתוך {data.pagination.total} לקוחות
        </div>
      )}
    </div>
  )
}
