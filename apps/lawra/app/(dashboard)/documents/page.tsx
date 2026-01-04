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
import { DocumentUploadForm } from '@/components/documents/document-upload-form'
import {
  documentTypeLabels,
  templateCategoryLabels,
  type DocumentType,
} from '@/lib/schemas/document'
import {
  Plus,
  Search,
  FileText,
  FileUp,
  Download,
  Trash2,
  MoreHorizontal,
  Loader2,
  FolderOpen,
  FileIcon,
  FileSpreadsheet,
  FileImage,
  Wand2,
} from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

// File type icon mapping
const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
  if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />
  if (mimeType.includes('image')) return <FileImage className="h-5 w-5 text-purple-500" />
  return <FileIcon className="h-5 w-5 text-gray-500" />
}

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  // Fetch documents
  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', { search, documentType: typeFilter }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (typeFilter !== 'all') params.set('documentType', typeFilter)

      const res = await fetch(`/api/documents?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch documents')
      return res.json()
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete document')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast({
        title: 'המסמך נמחק בהצלחה',
      })
      setDeleteDocId(null)
    },
    onError: () => {
      toast({
        title: 'שגיאה במחיקת המסמך',
        variant: 'destructive',
      })
    },
  })

  // Download document
  const handleDownload = async (id: string, filename: string) => {
    try {
      const res = await fetch(`/api/documents/${id}/download`)
      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: 'שגיאה בהורדת המסמך',
        variant: 'destructive',
      })
    }
  }

  // Handle upload success
  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['documents'] })
    setIsUploadDialogOpen(false)
    toast({
      title: 'המסמך הועלה בהצלחה',
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">מסמכים</h1>
          <p className="text-muted-foreground">
            ניהול ויצירת מסמכים משפטיים
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/documents/generate')}>
            <Wand2 className="me-2 h-4 w-4" />
            צור מסמך
          </Button>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileUp className="me-2 h-4 w-4" />
                העלאת מסמך
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>העלאת מסמך</DialogTitle>
                <DialogDescription>
                  העלה מסמך קיים למערכת
                </DialogDescription>
              </DialogHeader>
              <DocumentUploadForm onSuccess={handleUploadSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם קובץ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="סוג מסמך" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסוגים</SelectItem>
            {Object.entries(documentTypeLabels).map(([value, label]) => (
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
            שגיאה בטעינת המסמכים
          </div>
        ) : data?.documents?.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">אין מסמכים</h3>
            <p className="text-muted-foreground">
              התחל להעלות או ליצור מסמכים חדשים
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>מסמך</TableHead>
                <TableHead>סוג</TableHead>
                <TableHead>תיק</TableHead>
                <TableHead>גודל</TableHead>
                <TableHead>תאריך יצירה</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.documents?.map((doc: any) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.mime_type)}
                      <div>
                        <div className="font-medium line-clamp-1">{doc.filename}</div>
                        {doc.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {doc.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {doc.document_type ? (
                      <Badge variant="secondary">
                        {documentTypeLabels[doc.document_type as DocumentType]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {doc.case ? (
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1">{doc.case.title}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground" dir="ltr">
                      {formatFileSize(doc.size)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: he })}
                    </span>
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
                          onClick={() => handleDownload(doc.id, doc.filename)}
                        >
                          <Download className="me-2 h-4 w-4" />
                          הורדה
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteDocId(doc.id)}
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

      {/* Pagination info */}
      {data?.total !== undefined && (
        <div className="text-sm text-muted-foreground">
          מציג {data.documents?.length || 0} מתוך {data.total} מסמכים
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDocId} onOpenChange={() => setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את המסמך לצמיתות. לא ניתן לשחזר את המסמך לאחר המחיקה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteDocId && deleteMutation.mutate(deleteDocId)}
            >
              {deleteMutation.isPending ? (
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
