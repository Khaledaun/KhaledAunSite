'use client'

import { cn } from '@/lib/utils'

// Base skeleton with shimmer effect
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]',
        className
      )}
      {...props}
    />
  )
}

// Table row skeleton
function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border/50">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[150px]" />
      </div>
      {Array.from({ length: columns - 2 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-[80px]" />
      ))}
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
  )
}

// Table skeleton with header
function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-muted/30">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-[100px]" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  )
}

// Card skeleton
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border bg-card p-6 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  )
}

// Stat card skeleton
function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-muted to-muted/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-8 w-[60px]" />
      <Skeleton className="h-4 w-[100px]" />
    </div>
  )
}

// List item skeleton
function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30">
      <Skeleton className="h-3 w-3 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-[180px]" />
        <Skeleton className="h-3 w-[120px]" />
      </div>
      <Skeleton className="h-6 w-[60px] rounded-full" />
    </div>
  )
}

// Kanban column skeleton
function KanbanColumnSkeleton() {
  return (
    <div className="flex-1 min-w-[280px] rounded-2xl bg-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-[100px]" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-card p-4 space-y-3 border">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-[60px] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Chat message skeleton
function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && <Skeleton className="h-8 w-8 rounded-full" />}
      <div className={cn('max-w-[70%] space-y-2', isUser ? 'items-end' : 'items-start')}>
        <Skeleton className={cn('h-4 rounded-2xl', isUser ? 'w-[200px]' : 'w-[250px]')} />
        <Skeleton className={cn('h-4 rounded-2xl', isUser ? 'w-[150px]' : 'w-[300px]')} />
        <Skeleton className="h-4 w-[180px] rounded-2xl" />
      </div>
      {isUser && <Skeleton className="h-8 w-8 rounded-full" />}
    </div>
  )
}

// Page header skeleton
function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <Skeleton className="h-10 w-[120px] rounded-xl" />
    </div>
  )
}

// Filter bar skeleton
function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Skeleton className="h-10 w-[250px] rounded-xl" />
      <Skeleton className="h-10 w-[150px] rounded-xl" />
      <Skeleton className="h-10 w-[150px] rounded-xl" />
    </div>
  )
}

export {
  Skeleton,
  TableRowSkeleton,
  TableSkeleton,
  CardSkeleton,
  StatCardSkeleton,
  ListItemSkeleton,
  KanbanColumnSkeleton,
  ChatMessageSkeleton,
  PageHeaderSkeleton,
  FilterBarSkeleton,
}
