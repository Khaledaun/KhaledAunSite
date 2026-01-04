'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Timer } from './timer'
import {
  createTimeEntrySchema,
  activityTypeLabels,
  parseDurationString,
  type CreateTimeEntryInput,
  type ActivityType,
} from '@/lib/schemas/time-entry'
import { Loader2 } from 'lucide-react'

interface TimeEntryFormProps {
  onSuccess?: () => void
  defaultCaseId?: string
  defaultClientId?: string
}

export function TimeEntryForm({
  onSuccess,
  defaultCaseId,
  defaultClientId,
}: TimeEntryFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [durationInput, setDurationInput] = useState('')

  // Fetch cases
  const { data: casesData } = useQuery({
    queryKey: ['cases-list'],
    queryFn: async () => {
      const res = await fetch('/api/cases?limit=100')
      if (!res.ok) throw new Error('Failed to fetch cases')
      return res.json()
    },
  })

  // Fetch clients
  const { data: clientsData } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => {
      const res = await fetch('/api/clients?limit=100')
      if (!res.ok) throw new Error('Failed to fetch clients')
      return res.json()
    },
  })

  const form = useForm<CreateTimeEntryInput>({
    resolver: zodResolver(createTimeEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      durationMinutes: 0,
      description: '',
      activityType: null,
      caseId: defaultCaseId || null,
      clientId: defaultClientId || null,
      isBillable: true,
      hourlyRate: null,
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateTimeEntryInput) => {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create time entry')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      form.reset({
        date: new Date().toISOString().split('T')[0],
        durationMinutes: 0,
        description: '',
        activityType: null,
        caseId: defaultCaseId || null,
        clientId: defaultClientId || null,
        isBillable: true,
        hourlyRate: null,
      })
      setDurationInput('')
      toast({
        title: 'רישום זמן נוסף בהצלחה',
      })
      onSuccess?.()
    },
    onError: () => {
      toast({
        title: 'שגיאה בהוספת רישום זמן',
        variant: 'destructive',
      })
    },
  })

  // Handle timer stop
  const handleTimerStop = (minutes: number) => {
    form.setValue('durationMinutes', minutes)
    setDurationInput(`${minutes}`)
    setIsTimerRunning(false)
  }

  // Handle duration input change
  const handleDurationChange = (value: string) => {
    setDurationInput(value)
    const minutes = parseDurationString(value)
    if (minutes !== null) {
      form.setValue('durationMinutes', minutes)
    }
  }

  // Handle case selection
  const handleCaseChange = (caseId: string) => {
    form.setValue('caseId', caseId || null)
    // Also set client from case
    const caseData = casesData?.cases?.find((c: any) => c.id === caseId)
    if (caseData?.client) {
      form.setValue('clientId', caseData.client.id)
    }
  }

  const onSubmit = (data: CreateTimeEntryInput) => {
    createMutation.mutate(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Timer */}
      <Timer
        isRunning={isTimerRunning}
        onToggle={() => setIsTimerRunning(!isTimerRunning)}
        onStop={handleTimerStop}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">תאריך *</Label>
          <Input
            id="date"
            type="date"
            {...form.register('date')}
            dir="ltr"
          />
          {form.formState.errors.date && (
            <p className="text-sm text-destructive">
              {form.formState.errors.date.message}
            </p>
          )}
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration">משך זמן *</Label>
          <Input
            id="duration"
            value={durationInput}
            onChange={(e) => handleDurationChange(e.target.value)}
            placeholder="1:30 או 90 דקות"
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">
            פורמט: 1:30 (שעה ו-30 דקות) או 90 (דקות)
          </p>
        </div>

        {/* Case */}
        <div className="space-y-2">
          <Label>תיק</Label>
          <Select
            value={form.watch('caseId') || ''}
            onValueChange={handleCaseChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר תיק..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">ללא תיק</SelectItem>
              {casesData?.cases?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client */}
        <div className="space-y-2">
          <Label>לקוח</Label>
          <Select
            value={form.watch('clientId') || ''}
            onValueChange={(v) => form.setValue('clientId', v || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר לקוח..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">ללא לקוח</SelectItem>
              {clientsData?.clients?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activity Type */}
        <div className="space-y-2 sm:col-span-2">
          <Label>סוג פעילות</Label>
          <Select
            value={form.watch('activityType') || ''}
            onValueChange={(v) =>
              form.setValue('activityType', (v as ActivityType) || null)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר סוג פעילות..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">לא צוין</SelectItem>
              {Object.entries(activityTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">תיאור *</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="תאר את העבודה שבוצעה..."
          rows={3}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* Billing options */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="isBillable"
            checked={form.watch('isBillable')}
            onCheckedChange={(checked) =>
              form.setValue('isBillable', checked === true)
            }
          />
          <Label htmlFor="isBillable" className="text-sm font-normal">
            לחיוב
          </Label>
        </div>

        {form.watch('isBillable') && (
          <div className="flex items-center gap-2">
            <Label htmlFor="hourlyRate" className="text-sm font-normal">
              תעריף שעתי:
            </Label>
            <Input
              id="hourlyRate"
              type="number"
              className="w-24"
              placeholder="₪"
              {...form.register('hourlyRate', { valueAsNumber: true })}
              dir="ltr"
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={createMutation.isPending || !form.watch('durationMinutes')}
      >
        {createMutation.isPending ? (
          <>
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
            שומר...
          </>
        ) : (
          'הוסף רישום זמן'
        )}
      </Button>
    </form>
  )
}
