'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Square, Clock } from 'lucide-react'

interface TimerProps {
  onStop: (durationMinutes: number) => void
  isRunning: boolean
  onToggle: () => void
}

export function Timer({ onStop, isRunning, onToggle }: TimerProps) {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - (seconds * 1000)
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
          setSeconds(elapsed)
        }
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const handleStop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    const minutes = Math.ceil(seconds / 60)
    onStop(minutes)
    setSeconds(0)
    startTimeRef.current = null
  }, [seconds, onStop])

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
      <Clock className="h-5 w-5 text-muted-foreground" />

      <div className="font-mono text-2xl font-bold tabular-nums" dir="ltr">
        {formatTime(seconds)}
      </div>

      <div className="flex items-center gap-1 ms-auto">
        <Button
          type="button"
          variant={isRunning ? 'outline' : 'default'}
          size="icon"
          onClick={onToggle}
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {seconds > 0 && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleStop}
          >
            <Square className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
