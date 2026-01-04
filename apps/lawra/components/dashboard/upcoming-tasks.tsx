'use client'

import { BarChart2, Settings, Pencil } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'

// Team members
const teamColors: Record<string, string> = {
  R: 'bg-orange-500',
  K: 'bg-blue-500',
}

// Sample data matching mockup
const tasks = [
  {
    id: '1',
    title: 'Rami Zamel',
    subtitle: 'Motion - 09.01.2026',
    assignees: ['R', 'K'],
    completed: false,
  },
  {
    id: '2',
    title: 'Yousef Abu Gosh',
    subtitle: '11.01.2026',
    assignees: ['R', 'K'],
    completed: false,
  },
  {
    id: '3',
    title: 'Mohamed Salti',
    subtitle: '15.01.2026',
    assignees: ['K'],
    completed: false,
  },
  {
    id: '4',
    title: 'Jordan River',
    subtitle: 'Motion - 09.01.2026',
    assignees: ['R'],
    completed: false,
  },
  {
    id: '5',
    title: 'Rami Zamel',
    subtitle: 'Motion - 09.01.2026',
    assignees: ['R', 'K'],
    completed: false,
  },
]

export function UpcomingTasks() {
  return (
    <div className="lawra-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Upcoming Tasks:</h2>
        <div className="flex items-center gap-2">
          <button className="action-icon" title="תצוגת גרף">
            <BarChart2 className="w-5 h-5" />
          </button>
          <button className="action-icon" title="הגדרות">
            <Settings className="w-5 h-5" />
          </button>
          <button className="action-icon" title="עריכה">
            <Pencil className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            {/* Checkbox */}
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              className="rounded-full w-5 h-5"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <label
                htmlFor={`task-${task.id}`}
                className="font-medium cursor-pointer"
              >
                {task.title}
              </label>
              <span className="text-muted-foreground"> - {task.subtitle}</span>
            </div>

            {/* Assignees */}
            <div className="flex items-center -space-x-2 space-x-reverse">
              {task.assignees.map((assignee, index) => (
                <Avatar
                  key={index}
                  className={`w-7 h-7 border-2 border-background ${teamColors[assignee]}`}
                >
                  <AvatarFallback className={`${teamColors[assignee]} text-white text-xs`}>
                    {assignee}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
