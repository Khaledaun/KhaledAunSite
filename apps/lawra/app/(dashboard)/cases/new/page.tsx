'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  createCaseSchema,
  type CreateCaseInput,
  caseTypeLabels,
  practiceAreaLabels,
  caseStatusLabels,
  priorityLabels,
  feeTypeLabels,
} from '@/lib/schemas/case'
import { ArrowRight, Loader2, Search } from 'lucide-react'

export default function NewCasePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [clientSearch, setClientSearch] = useState('')

  const preselectedClientId = searchParams.get('clientId')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCaseInput>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      clientId: preselectedClientId || '',
      caseType: 'LITIGATION',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      feeType: 'HOURLY',
      tags: [],
    },
  })

  // Fetch clients for selection
  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients', { search: clientSearch }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (clientSearch) params.set('search', clientSearch)
      params.set('limit', '50')

      const res = await fetch(`/api/clients?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch clients')
      return res.json()
    },
  })

  // Create case mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateCaseInput) => {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create case')
      }
      return res.json()
    },
    onSuccess: (caseRecord) => {
      toast({
        title: 'התיק נוצר בהצלחה',
        description: `התיק "${caseRecord.title}" נוסף למערכת`,
      })
      router.push(`/cases/${caseRecord.id}`)
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה ביצירת התיק',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const clientId = watch('clientId')
  const caseType = watch('caseType')
  const status = watch('status')
  const priority = watch('priority')
  const feeType = watch('feeType')
  const practiceArea = watch('practiceArea')

  // Set preselected client
  useEffect(() => {
    if (preselectedClientId) {
      setValue('clientId', preselectedClientId)
    }
  }, [preselectedClientId, setValue])

  const onSubmit = (data: CreateCaseInput) => {
    createMutation.mutate(data)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">פתיחת תיק חדש</h1>
          <p className="text-muted-foreground">
            מלא את פרטי התיק ליצירת תיק חדש במערכת
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle>בחירת לקוח</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>לקוח *</Label>
              <Select
                value={clientId}
                onValueChange={(value) => setValue('clientId', value)}
                disabled={createMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר לקוח" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="חפש לקוח..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {clientsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    clientsData?.clients?.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-sm text-destructive">{errors.clientId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי התיק</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">כותרת התיק *</Label>
              <Input
                id="title"
                placeholder="כותרת התיק"
                {...register('title')}
                disabled={createMutation.isPending}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseNumber">מספר תיק בית משפט</Label>
              <Input
                id="caseNumber"
                placeholder="לדוגמה: ת.א 12345-10-25"
                dir="ltr"
                {...register('caseNumber')}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalReference">מספר תיק פנימי</Label>
              <Input
                id="internalReference"
                placeholder="יווצר אוטומטית אם ריק"
                dir="ltr"
                {...register('internalReference')}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>סוג תיק</Label>
              <Select
                value={caseType}
                onValueChange={(value) => setValue('caseType', value as any)}
                disabled={createMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(caseTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>תחום משפטי</Label>
              <Select
                value={practiceArea || ''}
                onValueChange={(value) => setValue('practiceArea', value as any)}
                disabled={createMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר תחום" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(practiceAreaLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue('status', value as any)}
                disabled={createMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(caseStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>עדיפות</Label>
              <Select
                value={priority}
                onValueChange={(value) => setValue('priority', value as any)}
                disabled={createMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Court Info */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי בית משפט</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="court">בית משפט</Label>
              <Input
                id="court"
                placeholder="לדוגמה: בית משפט השלום תל אביב"
                {...register('court')}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="judge">שופט</Label>
              <Input
                id="judge"
                placeholder="שם השופט"
                {...register('judge')}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opposingParty">צד שכנגד</Label>
              <Input
                id="opposingParty"
                placeholder="שם הצד השני"
                {...register('opposingParty')}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opposingCounsel">ב"כ צד שכנגד</Label>
              <Input
                id="opposingCounsel"
                placeholder="שם עורך הדין"
                {...register('opposingCounsel')}
                disabled={createMutation.isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי שכר טרחה</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>סוג שכ"ט</Label>
              <Select
                value={feeType}
                onValueChange={(value) => setValue('feeType', value as any)}
                disabled={createMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(feeTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeAmount">סכום שכ"ט (₪)</Label>
              <Input
                id="feeAmount"
                type="number"
                placeholder="0"
                dir="ltr"
                {...register('feeAmount', { valueAsNumber: true })}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retainerAmount">מקדמה (₪)</Label>
              <Input
                id="retainerAmount"
                type="number"
                placeholder="0"
                dir="ltr"
                {...register('retainerAmount', { valueAsNumber: true })}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">מועד יעד</Label>
              <Input
                id="deadline"
                type="date"
                dir="ltr"
                {...register('deadline')}
                disabled={createMutation.isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>תיאור והערות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">תיאור התיק</Label>
              <textarea
                id="description"
                placeholder="תיאור מפורט של התיק..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('description')}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">הערות פנימיות</Label>
              <textarea
                id="notes"
                placeholder="הערות נוספות..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('notes')}
                disabled={createMutation.isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createMutation.isPending}
          >
            ביטול
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                יוצר תיק...
              </>
            ) : (
              'צור תיק'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
