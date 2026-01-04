'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { documentTypeLabels, documentTypes } from '@/lib/schemas/document'
import { Upload, X, FileIcon, Loader2 } from 'lucide-react'

interface DocumentUploadFormProps {
  caseId?: string
  onSuccess?: () => void
}

export function DocumentUploadForm({ caseId, onSuccess }: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>('')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch cases for selection
  const { data: casesData } = useQuery({
    queryKey: ['cases-list'],
    queryFn: async () => {
      const res = await fetch('/api/cases?limit=100')
      if (!res.ok) throw new Error('Failed to fetch cases')
      return res.json()
    },
    enabled: !caseId, // Only fetch if no caseId provided
  })

  const [selectedCaseId, setSelectedCaseId] = useState<string>(caseId || '')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'text/plain': ['.txt'],
    },
    onDropRejected: (rejections) => {
      const rejection = rejections[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('הקובץ גדול מדי. הגודל המקסימלי הוא 50MB')
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('סוג קובץ לא נתמך')
      } else {
        setError('שגיאה בהעלאת הקובץ')
      }
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('יש לבחור קובץ')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (selectedCaseId) formData.append('caseId', selectedCaseId)
      if (documentType) formData.append('documentType', documentType)
      if (description) formData.append('description', description)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'שגיאה בהעלאת הקובץ')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהעלאת הקובץ')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${file ? 'border-green-500 bg-green-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileIcon className="h-8 w-8 text-green-600" />
            <div className="text-start">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 font-medium">
              {isDragActive ? 'שחרר כאן...' : 'גרור קובץ לכאן או לחץ לבחירה'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, Word, Excel, תמונות (עד 50MB)
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Case selection (if not provided) */}
      {!caseId && (
        <div className="space-y-2">
          <Label>שייך לתיק (אופציונלי)</Label>
          <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
            <SelectTrigger>
              <SelectValue placeholder="בחר תיק..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">ללא שיוך לתיק</SelectItem>
              {casesData?.cases?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Document type */}
      <div className="space-y-2">
        <Label>סוג מסמך (אופציונלי)</Label>
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger>
            <SelectValue placeholder="בחר סוג..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">לא מוגדר</SelectItem>
            {Object.entries(documentTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>תיאור (אופציונלי)</Label>
        <Textarea
          placeholder="הוסף תיאור למסמך..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      {/* Submit button */}
      <Button type="submit" className="w-full" disabled={!file || isUploading}>
        {isUploading ? (
          <>
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
            מעלה...
          </>
        ) : (
          <>
            <Upload className="me-2 h-4 w-4" />
            העלה מסמך
          </>
        )}
      </Button>
    </form>
  )
}
