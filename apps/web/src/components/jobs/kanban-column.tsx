"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { JobStatus } from "@/lib/types"
import { JobCard } from "./job-card"
import { useJobsByStatus } from "@/lib/hooks/use-jobs-by-status"
import { useIntersectionObserver } from "@/lib/hooks/use-intersection-observer"

interface Props {
  id: JobStatus
  label: string
  emoji: string
  search?: string
  filterPlatform?: string
}

export function KanbanColumn({ id, label, emoji, search = "", filterPlatform = "all" }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useJobsByStatus(id, search, filterPlatform)

  const jobs = data?.pages.flatMap((p) => p.data) ?? []
  const total = data?.pages[0]?.meta.total ?? 0

  const loaderRef = useIntersectionObserver(
    () => { if (hasNextPage) fetchNextPage() },
    hasNextPage ?? false
  )

  return (
    <div className="flex flex-col flex-1 min-w-[200px] min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {total}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 flex-1 overflow-y-auto rounded-lg p-2 transition-colors ${
          isOver ? "bg-secondary/50" : "bg-secondary/20"
        }`}
      >
        <SortableContext
          items={jobs.map((j) => j.id)}
          strategy={verticalListSortingStrategy}
        >
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </SortableContext>

        {jobs.length === 0 && !isFetchingNextPage && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Drop here</p>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loaderRef} className="py-1 flex justify-center">
          {isFetchingNextPage && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          )}
        </div>
      </div>
    </div>
  )
}
