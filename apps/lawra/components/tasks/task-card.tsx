'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { priorityLabels } from '@/lib/schemas/task'
import { Calendar, AlertTriangle, FolderOpen, GripVertical } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { he } from 'date-fns/locale'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string | null
    priority: string
    dueDate?: string | null
    case?: { id: string; title: string } | null
    client?: { id: string; name: string } | null
  }
  onClick?: () => void
}

const priorityColors: Record<string, string> = {
  LOW: 'border-l-gray-300',
  MEDIUM: 'border-l-blue-400',
  HIGH: 'border-l-amber-400',
  URGENT: 'border-l-red-500',
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate))

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group bg-white rounded-lg border border-l-4 p-3 shadow-sm cursor-pointer
        hover:shadow-md transition-shadow
        ${priorityColors[task.priority]}
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <button
          className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Due date */}
            {task.dueDate && (
              <div className={`
                flex items-center gap-1 text-xs
                ${isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-amber-600' : 'text-muted-foreground'}
              `}>
                <Calendar className="h-3 w-3" />
                <span>
                  {isOverdue ? 'באיחור: ' : ''}
                  {format(new Date(task.dueDate), 'dd/MM', { locale: he })}
                </span>
              </div>
            )}

            {/* Case badge */}
            {task.case && (
              <Badge variant="outline" className="text-xs py-0 h-5">
                <FolderOpen className="h-3 w-3 me-1" />
                {task.case.title.length > 15
                  ? task.case.title.substring(0, 15) + '...'
                  : task.case.title}
              </Badge>
            )}

            {/* Priority indicator for urgent */}
            {task.priority === 'URGENT' && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>{priorityLabels.URGENT}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
