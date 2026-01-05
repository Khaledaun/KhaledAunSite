'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useToast } from '@/components/ui/use-toast'
import { KanbanColumn } from '@/components/tasks/kanban-column'
import { TaskCard } from '@/components/tasks/task-card'
import { KanbanColumnSkeleton } from '@/components/ui/skeletons'
import { kanbanColumns, priorityLabels, type CreateTaskInput } from '@/lib/schemas/task'
import { Plus, Loader2, Search, CheckSquare, Sparkles } from 'lucide-react'

export default function TasksPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const preselectedCaseId = searchParams.get('caseId')

  const [activeTask, setActiveTask] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addTaskStatus, setAddTaskStatus] = useState('TODO')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM')
  const [search, setSearch] = useState('')

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch tasks
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', { search, caseId: preselectedCaseId }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (preselectedCaseId) params.set('caseId', preselectedCaseId)
      params.set('includeDone', 'true')

      const res = await fetch(`/api/tasks?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      return res.json()
    },
  })

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create task')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsAddDialogOpen(false)
      setNewTaskTitle('')
      toast({
        title: 'משימה נוספה בהצלחה',
      })
    },
    onError: () => {
      toast({
        title: 'שגיאה ביצירת משימה',
        variant: 'destructive',
      })
    },
  })

  // Update task mutation (for drag & drop)
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update task')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: () => {
      toast({
        title: 'שגיאה בעדכון משימה',
        variant: 'destructive',
      })
    },
  })

  // Get tasks by status
  const getTasksByStatus = useCallback((status: string) => {
    if (!data?.tasks) return []
    return data.tasks.filter((task: any) => task.status === status)
  }, [data?.tasks])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = data?.tasks?.find((t: any) => t.id === active.id)
    setActiveTask(task)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if dropped on a column
    const targetColumn = kanbanColumns.find(col => col.id === overId)

    if (targetColumn) {
      // Dropped on a column - move to that status
      const task = data?.tasks?.find((t: any) => t.id === activeId)
      if (task && task.status !== targetColumn.id) {
        updateMutation.mutate({
          id: activeId,
          data: { status: targetColumn.id },
        })
      }
    } else {
      // Dropped on another task - find the column
      const overTask = data?.tasks?.find((t: any) => t.id === overId)
      if (overTask) {
        const task = data?.tasks?.find((t: any) => t.id === activeId)
        if (task && task.status !== overTask.status) {
          updateMutation.mutate({
            id: activeId,
            data: { status: overTask.status },
          })
        }
      }
    }
  }

  // Handle add task
  const handleAddTask = (status: string) => {
    setAddTaskStatus(status)
    setIsAddDialogOpen(true)
  }

  // Handle task click
  const handleTaskClick = (task: any) => {
    // TODO: Open task detail drawer
    console.log('Task clicked:', task)
  }

  // Handle create task submit
  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return

    createMutation.mutate({
      title: newTaskTitle,
      status: addTaskStatus as any,
      priority: newTaskPriority as any,
      caseId: preselectedCaseId || undefined,
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with gradient */}
      <div className="p-6 border-b bg-gradient-to-l from-amber-500/5 via-orange-500/5 to-transparent animate-fade-in-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                <CheckSquare className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-l from-amber-600 to-orange-600 bg-clip-text text-transparent">
                משימות
              </h1>
            </div>
            <p className="text-muted-foreground">
              ניהול משימות בתצוגת קנבן
            </p>
          </div>

          <Button
            onClick={() => handleAddTask('TODO')}
            className="bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="me-2 h-4 w-4" />
            משימה חדשה
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש משימות..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10 bg-background/50 backdrop-blur-sm border-muted/50 focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-transparent to-muted/20">
        {isLoading ? (
          <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
            {kanbanColumns.map((_, index) => (
              <KanbanColumnSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <CheckSquare className="h-8 w-8 text-destructive/60" />
            </div>
            <p>שגיאה בטעינת המשימות</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
              {kanbanColumns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  color={column.color}
                  tasks={getTasksByStatus(column.id)}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTask}
                />
              ))}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTask ? (
                <div className="opacity-80">
                  <TaskCard task={activeTask} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="glass-premium border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              משימה חדשה
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">כותרת המשימה *</Label>
              <Input
                id="title"
                placeholder="מה צריך לעשות?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTaskTitle.trim()) {
                    handleCreateTask()
                  }
                }}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>סטטוס</Label>
                <Select value={addTaskStatus} onValueChange={setAddTaskStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kanbanColumns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>עדיפות</Label>
                <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
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
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="border-muted/50"
            >
              ביטול
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!newTaskTitle.trim() || createMutation.isPending}
              className="bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  יוצר...
                </>
              ) : (
                'צור משימה'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
