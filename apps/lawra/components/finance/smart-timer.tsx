'use client'

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Play,
  Pause,
  Square,
  Clock,
  Minimize2,
  Maximize2,
  FolderOpen,
  User,
  Sparkles,
  X,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { activityTypeLabels, type ActivityType } from '@/lib/schemas/time-entry'
import { cn } from '@/lib/utils'

// Timer context for global state
interface TimerState {
  isRunning: boolean
  startTime: number | null
  caseId: string | null
  caseName: string | null
  clientId: string | null
  clientName: string | null
  activityType: ActivityType | null
  description: string
}

interface TimerContextType {
  state: TimerState
  start: (options?: { caseId?: string; caseName?: string; clientId?: string; clientName?: string }) => void
  pause: () => void
  resume: () => void
  stop: () => void
  setCase: (caseId: string, caseName: string) => void
  setClient: (clientId: string, clientName: string) => void
  setActivityType: (type: ActivityType) => void
  setDescription: (desc: string) => void
  getElapsedSeconds: () => number
}

const TimerContext = createContext<TimerContextType | null>(null)

export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}

// Persist timer state to localStorage
const TIMER_STORAGE_KEY = 'lawra-timer-state'

function loadTimerState(): TimerState {
  if (typeof window === 'undefined') {
    return getDefaultState()
  }
  try {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {}
  return getDefaultState()
}

function saveTimerState(state: TimerState) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state))
}

function getDefaultState(): TimerState {
  return {
    isRunning: false,
    startTime: null,
    caseId: null,
    caseName: null,
    clientId: null,
    clientName: null,
    activityType: null,
    description: '',
  }
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>(getDefaultState)

  // Load state on mount
  useEffect(() => {
    setState(loadTimerState())
  }, [])

  // Save state on change
  useEffect(() => {
    saveTimerState(state)
  }, [state])

  const getElapsedSeconds = useCallback(() => {
    if (!state.startTime) return 0
    return Math.floor((Date.now() - state.startTime) / 1000)
  }, [state.startTime])

  const start = useCallback((options?: { caseId?: string; caseName?: string; clientId?: string; clientName?: string }) => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      startTime: Date.now(),
      caseId: options?.caseId || prev.caseId,
      caseName: options?.caseName || prev.caseName,
      clientId: options?.clientId || prev.clientId,
      clientName: options?.clientName || prev.clientName,
    }))
  }, [])

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }))
  }, [])

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }))
  }, [])

  const stop = useCallback(() => {
    setState(getDefaultState())
  }, [])

  const setCase = useCallback((caseId: string, caseName: string) => {
    setState(prev => ({ ...prev, caseId, caseName }))
  }, [])

  const setClient = useCallback((clientId: string, clientName: string) => {
    setState(prev => ({ ...prev, clientId, clientName }))
  }, [])

  const setActivityType = useCallback((type: ActivityType) => {
    setState(prev => ({ ...prev, activityType: type }))
  }, [])

  const setDescription = useCallback((description: string) => {
    setState(prev => ({ ...prev, description }))
  }, [])

  return (
    <TimerContext.Provider
      value={{
        state,
        start,
        pause,
        resume,
        stop,
        setCase,
        setClient,
        setActivityType,
        setDescription,
        getElapsedSeconds,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

// Activity suggestions based on context
const activitySuggestions: Record<string, ActivityType[]> = {
  default: ['RESEARCH', 'DRAFTING', 'EMAIL', 'PHONE_CALL'],
  court: ['COURT_APPEARANCE', 'FILING', 'RESEARCH'],
  meeting: ['MEETING_CLIENT', 'MEETING_OTHER', 'NEGOTIATION'],
  document: ['DRAFTING', 'REVIEW', 'CORRESPONDENCE'],
}

// Floating Timer Widget
export function FloatingTimer() {
  const timer = useTimer()
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const queryClient = useQueryClient()

  // Update seconds every second when running
  useEffect(() => {
    if (!timer.state.isRunning) return

    const interval = setInterval(() => {
      setSeconds(timer.getElapsedSeconds())
    }, 1000)

    return () => clearInterval(interval)
  }, [timer.state.isRunning, timer.getElapsedSeconds])

  // Fetch cases for selection
  const { data: casesData } = useQuery({
    queryKey: ['timer-cases'],
    queryFn: async () => {
      const res = await fetch('/api/cases?status=ACTIVE&limit=50')
      return res.ok ? res.json() : { cases: [] }
    },
    enabled: timer.state.isRunning,
  })

  // Save time entry mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-time'] })
      timer.stop()
      setShowSaveDialog(false)
    },
  })

  const handleStop = () => {
    if (seconds >= 60) {
      setShowSaveDialog(true)
    } else {
      timer.stop()
    }
  }

  const handleSave = () => {
    const minutes = Math.ceil(seconds / 60)
    saveMutation.mutate({
      date: new Date().toISOString().split('T')[0],
      durationMinutes: minutes,
      description: timer.state.description || 'רישום זמן',
      activityType: timer.state.activityType,
      caseId: timer.state.caseId,
      clientId: timer.state.clientId,
      isBillable: true,
    })
  }

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Don't show if no timer is running and not minimized
  if (!timer.state.isRunning && !timer.state.startTime) {
    return null
  }

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
        onClick={() => setIsMinimized(false)}
      >
        <Clock className="h-4 w-4 animate-pulse" />
        <span className="font-mono font-bold" dir="ltr">{formatTime(seconds)}</span>
        {timer.state.caseName && (
          <Badge variant="secondary" className="text-xs bg-white/20">
            {timer.state.caseName}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50 w-80 glass-premium p-4 shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-xl",
              timer.state.isRunning
                ? "bg-green-500/20 text-green-600"
                : "bg-orange-500/20 text-orange-600"
            )}>
              <Clock className="h-5 w-5" />
            </div>
            <span className="font-semibold">מעקב זמן</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => timer.stop()}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-4">
          <div className="font-mono text-4xl font-bold tabular-nums bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent" dir="ltr">
            {formatTime(seconds)}
          </div>
        </div>

        {/* Case/Client Display */}
        {(timer.state.caseName || timer.state.clientName) && (
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            {timer.state.caseName && (
              <Badge variant="outline" className="gap-1">
                <FolderOpen className="h-3 w-3" />
                {timer.state.caseName}
              </Badge>
            )}
            {timer.state.clientName && (
              <Badge variant="outline" className="gap-1">
                <User className="h-3 w-3" />
                {timer.state.clientName}
              </Badge>
            )}
          </div>
        )}

        {/* Quick Activity Type Selection */}
        <div className="flex flex-wrap gap-1 mb-3">
          {activitySuggestions.default.map(type => (
            <Button
              key={type}
              variant={timer.state.activityType === type ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7"
              onClick={() => timer.setActivityType(type)}
            >
              {activityTypeLabels[type]}
            </Button>
          ))}
        </div>

        {/* Description Input */}
        <Input
          value={timer.state.description}
          onChange={(e) => timer.setDescription(e.target.value)}
          placeholder="תיאור הפעולה..."
          className="mb-3"
        />

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={timer.state.isRunning ? 'outline' : 'default'}
            className="flex-1"
            onClick={() => timer.state.isRunning ? timer.pause() : timer.resume()}
          >
            {timer.state.isRunning ? (
              <>
                <Pause className="h-4 w-4 me-2" />
                השהה
              </>
            ) : (
              <>
                <Play className="h-4 w-4 me-2" />
                המשך
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            onClick={handleStop}
          >
            <Square className="h-4 w-4 me-2" />
            סיום
          </Button>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>שמירת רישום זמן</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-3xl font-bold font-mono" dir="ltr">
                {formatTime(seconds)}
              </div>
              <p className="text-muted-foreground mt-1">
                {Math.ceil(seconds / 60)} דקות לחיוב
              </p>
            </div>

            <div className="space-y-2">
              <Label>תיק</Label>
              <Select
                value={timer.state.caseId || ''}
                onValueChange={(id) => {
                  const caseItem = casesData?.cases?.find((c: any) => c.id === id)
                  if (caseItem) {
                    timer.setCase(id, caseItem.title)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר תיק" />
                </SelectTrigger>
                <SelectContent>
                  {casesData?.cases?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>סוג פעילות</Label>
              <Select
                value={timer.state.activityType || ''}
                onValueChange={(type) => timer.setActivityType(type as ActivityType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג פעילות" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(activityTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>תיאור</Label>
              <Input
                value={timer.state.description}
                onChange={(e) => timer.setDescription(e.target.value)}
                placeholder="תיאור הפעולה..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { timer.stop(); setShowSaveDialog(false) }}>
              בטל
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'שומר...' : 'שמור רישום'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Quick Start Timer Button (for sidebar/header)
export function QuickTimerButton({ caseId, caseName }: { caseId?: string; caseName?: string }) {
  const timer = useTimer()

  if (timer.state.isRunning) {
    return null // FloatingTimer will show instead
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => timer.start({ caseId, caseName })}
    >
      <Play className="h-4 w-4" />
      התחל מעקב זמן
    </Button>
  )
}
