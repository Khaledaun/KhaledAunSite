'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  createCalendarEventSchema,
  eventTypeLabels,
  eventTypeColors,
  type CreateCalendarEventInput,
  type EventType,
} from '@/lib/schemas/calendar-event'
import { cn } from '@/lib/utils'
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Loader2,
  MapPin,
  Clock,
  FolderOpen,
  Trash2,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns'
import { he } from 'date-fns/locale'

export default function CalendarPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)

  // Calculate date range for current month view
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  // Fetch events for the current month
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['calendar-events', { start: calendarStart, end: calendarEnd }],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: calendarStart.toISOString(),
        endDate: calendarEnd.toISOString(),
      })
      const res = await fetch(`/api/calendar-events?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch events')
      return res.json()
    },
  })

  // Fetch cases for the form
  const { data: casesData } = useQuery({
    queryKey: ['cases-list'],
    queryFn: async () => {
      const res = await fetch('/api/cases?limit=100')
      if (!res.ok) throw new Error('Failed to fetch cases')
      return res.json()
    },
  })

  // Form for creating events
  const form = useForm<CreateCalendarEventInput>({
    resolver: zodResolver(createCalendarEventSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      allDay: false,
      eventType: null,
      caseId: null,
    },
  })

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateCalendarEventInput) => {
      const res = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create event')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      setIsAddDialogOpen(false)
      form.reset()
      toast({ title: 'האירוע נוצר בהצלחה' })
    },
    onError: () => {
      toast({
        title: 'שגיאה ביצירת האירוע',
        variant: 'destructive',
      })
    },
  })

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/calendar-events/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete event')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      setDeleteEventId(null)
      setIsViewDialogOpen(false)
      toast({ title: 'האירוע נמחק בהצלחה' })
    },
    onError: () => {
      toast({
        title: 'שגיאה במחיקת האירוע',
        variant: 'destructive',
      })
    },
  })

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {}
    eventsData?.events?.forEach((event: any) => {
      const dateKey = format(new Date(event.startTime), 'yyyy-MM-dd')
      if (!map[dateKey]) {
        map[dateKey] = []
      }
      map[dateKey].push(event)
    })
    return map
  }, [eventsData?.events])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = []
    let day = calendarStart
    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [calendarStart, calendarEnd])

  // Handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    const dateStr = format(date, "yyyy-MM-dd'T'09:00")
    const endDateStr = format(date, "yyyy-MM-dd'T'10:00")
    form.setValue('startTime', dateStr)
    form.setValue('endTime', endDateStr)
    setIsAddDialogOpen(true)
  }

  // Handle event click
  const handleEventClick = (event: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setIsViewDialogOpen(true)
  }

  // Handle navigation
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  const onSubmit = (data: CreateCalendarEventInput) => {
    createMutation.mutate(data)
  }

  const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">יומן</h1>
          <p className="text-muted-foreground">
            ניהול פגישות, דיונים ואירועים
          </p>
        </div>

        <Button onClick={() => {
          form.reset()
          setIsAddDialogOpen(true)
        }}>
          <Plus className="me-2 h-4 w-4" />
          אירוע חדש
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            היום
          </Button>
        </div>

        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy', { locale: he })}
        </h2>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3">
            {Object.entries(eventTypeLabels).slice(0, 4).map(([type, label]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={cn('w-3 h-3 rounded-full', eventTypeColors[type as EventType])} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 rounded-xl border bg-card overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-medium text-muted-foreground border-e last:border-e-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((day, index) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDate[dateKey] || []
            const isCurrentMonth = isSameMonth(day, currentDate)
            const today = isToday(day)

            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={cn(
                  'min-h-[100px] p-2 border-e border-b cursor-pointer transition-colors hover:bg-muted/50',
                  !isCurrentMonth && 'bg-muted/20 text-muted-foreground',
                  index % 7 === 6 && 'border-e-0'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-7 h-7 text-sm rounded-full',
                      today && 'bg-primary text-primary-foreground font-bold'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event: any) => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className={cn(
                        'px-2 py-1 rounded text-xs text-white truncate cursor-pointer hover:opacity-80',
                        eventTypeColors[event.eventType as EventType] || 'bg-gray-500'
                      )}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-2">
                      +{dayEvents.length - 3} עוד
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>אירוע חדש</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">כותרת *</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="כותרת האירוע"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">התחלה *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  {...form.register('startTime')}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">סיום *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  {...form.register('endTime')}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="allDay"
                checked={form.watch('allDay')}
                onCheckedChange={(checked) =>
                  form.setValue('allDay', checked === true)
                }
              />
              <Label htmlFor="allDay" className="text-sm font-normal">
                כל היום
              </Label>
            </div>

            <div className="space-y-2">
              <Label>סוג אירוע</Label>
              <Select
                value={form.watch('eventType') || ''}
                onValueChange={(v) =>
                  form.setValue('eventType', (v as EventType) || null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(eventTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <span className={cn('w-3 h-3 rounded-full', eventTypeColors[value as EventType])} />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>תיק קשור</Label>
              <Select
                value={form.watch('caseId') || ''}
                onValueChange={(v) => form.setValue('caseId', v || null)}
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

            <div className="space-y-2">
              <Label htmlFor="location">מיקום</Label>
              <Input
                id="location"
                {...form.register('location')}
                placeholder="מיקום האירוע"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="פרטים נוספים..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                ביטול
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'צור אירוע'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.eventType && (
                <span
                  className={cn(
                    'w-3 h-3 rounded-full',
                    eventTypeColors[selectedEvent.eventType as EventType]
                  )}
                />
              )}
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {selectedEvent.allDay ? (
                    'כל היום'
                  ) : (
                    <>
                      {format(new Date(selectedEvent.startTime), 'HH:mm', { locale: he })}
                      {' - '}
                      {format(new Date(selectedEvent.endTime), 'HH:mm', { locale: he })}
                    </>
                  )}
                  {', '}
                  {format(new Date(selectedEvent.startTime), 'EEEE, d בMMMM yyyy', { locale: he })}
                </span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.case && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FolderOpen className="h-4 w-4" />
                  <span>{selectedEvent.case.title}</span>
                </div>
              )}

              {selectedEvent.eventType && (
                <Badge className={eventTypeColors[selectedEvent.eventType as EventType]}>
                  {eventTypeLabels[selectedEvent.eventType as EventType]}
                </Badge>
              )}

              {selectedEvent.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.description}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteEventId(selectedEvent.id)}
                >
                  <Trash2 className="me-2 h-4 w-4" />
                  מחק
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את האירוע לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteEventId && deleteMutation.mutate(deleteEventId)}
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
