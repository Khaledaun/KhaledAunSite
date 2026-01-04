'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './task-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  tasks: any[]
  onTaskClick: (task: any) => void
  onAddTask: (status: string) => void
}

export function KanbanColumn({
  id,
  title,
  color,
  tasks,
  onTaskClick,
  onAddTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex-1 min-w-[280px] max-w-[350px]">
      <div className={`rounded-t-xl ${color} p-3 border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            <span className="text-sm text-muted-foreground bg-white/50 px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onAddTask(id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`
          min-h-[500px] p-2 space-y-2 rounded-b-xl border border-t-0 transition-colors
          ${isOver ? 'bg-primary/5' : 'bg-muted/30'}
        `}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            גרור משימות לכאן
          </div>
        )}
      </div>
    </div>
  )
}
