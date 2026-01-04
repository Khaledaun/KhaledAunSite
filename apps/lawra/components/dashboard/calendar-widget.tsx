'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Event types with colors from mockup
const eventTypes = {
  meeting: { label: 'Meeting', color: 'bg-green-500' },
  hearing: { label: 'court hearing', color: 'bg-red-500' },
  deadline: { label: 'deadline', color: 'bg-orange-500' },
  internal: { label: 'internal', color: 'bg-blue-500' },
  marketing: { label: 'marketing', color: 'bg-pink-500' },
}

// Sample events for January 2026
const events: Record<number, string[]> = {
  3: ['meeting'],
  7: ['hearing'],
  13: ['deadline'],
  17: ['meeting', 'deadline'],
  18: ['hearing'],
  19: ['deadline'],
  21: ['meeting'],
  25: ['hearing'],
  27: ['meeting'],
}

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function CalendarWidget() {
  const [currentDate] = useState(new Date(2026, 0, 1)) // January 2026

  // Get days in month
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Create calendar grid
  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' })

  return (
    <div className="lawra-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Calendar</h2>
        <Button variant="ghost" size="icon">
          <ChevronLeft className="w-5 h-5 rtl-flip" />
        </Button>
      </div>

      {/* Month/Year */}
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold tracking-wide">
          {monthName.toUpperCase()} {year}
        </h3>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayEvents = day ? events[day] || [] : []
          const isToday = day === 4 // Assuming today is Jan 4

          return (
            <div
              key={index}
              className={cn(
                'relative p-2 text-center rounded-lg transition-colors',
                day && 'hover:bg-muted cursor-pointer',
                isToday && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {day && (
                <>
                  <span className="text-sm">{day}</span>
                  {/* Event dots */}
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <span
                          key={i}
                          className={cn(
                            'calendar-dot',
                            eventTypes[event as keyof typeof eventTypes]?.color
                          )}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
        <div className="flex items-center gap-1.5">
          <span className="calendar-dot calendar-dot-meeting" />
          <span className="text-xs text-muted-foreground">Meeting</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="calendar-dot calendar-dot-hearing" />
          <span className="text-xs text-muted-foreground">court hearing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="calendar-dot calendar-dot-deadline" />
          <span className="text-xs text-muted-foreground">deadline</span>
        </div>
      </div>
    </div>
  )
}
