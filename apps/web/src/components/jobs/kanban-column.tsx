"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Job, JobStatus } from "@/lib/types"
import { JobCard } from "./job-card"

interface Props {
  id: JobStatus
  label: string
  emoji: string
  jobs: Job[]
}

export function KanbanColumn({ id, label, emoji, jobs }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-col flex-1 min-w-[200px] min-h-0">

      {/* Column Header — sticky */}
      <div className="flex items-center justify-between px-1 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {jobs.length}
        </span>
      </div>

      {/* Drop Zone — scroll independent */}
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

        {jobs.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Drop here</p>
          </div>
        )}
      </div>
    </div>
  )
}
