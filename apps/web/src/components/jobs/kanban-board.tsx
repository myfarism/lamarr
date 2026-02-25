"use client"

import { useState } from "react"
import {
  DndContext, DragEndEvent, DragOverlay,
  DragStartEvent, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core"
import { useJobs, useUpdateJobStatus } from "@/lib/hooks/use-jobs"
import { KanbanColumn } from "./kanban-column"
import { JobCard } from "./job-card"
import { Job, JobStatus, KANBAN_COLUMNS } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { useState as useColState } from "react"
import { ChevronDown } from "lucide-react"
import { EmptyState } from "./empty-state"


// Mobile: accordion list per kolom
function MobileBoard({ jobs }: { jobs: Job[] }) {
  const [expanded, setExpanded] = useColState<JobStatus | null>("applied")
  const { mutate: updateStatus } = useUpdateJobStatus()

  return (
    <div className="space-y-2">
      {KANBAN_COLUMNS.map((col) => {
        const colJobs = jobs.filter((j) => j.status === col.id)
        const isOpen = expanded === col.id

        return (
          <div key={col.id} className="rounded-lg border border-border overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-secondary/20 hover:bg-secondary/40 transition-colors"
              onClick={() => setExpanded(isOpen ? null : col.id)}
            >
              <div className="flex items-center gap-2">
                <span>{col.emoji}</span>
                <span className="text-sm font-medium">{col.label}</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {colJobs.length}
                </Badge>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="p-3 space-y-2">
                {colJobs.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No applications here</p>
                ) : (
                  colJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function KanbanBoard() {
  const { data: jobs = [], isLoading } = useJobs()
  const { mutate: updateStatus } = useUpdateJobStatus()
  const [activeJob, setActiveJob] = useState<Job | null>(null)
  const VALID_STATUSES = new Set(KANBAN_COLUMNS.map((c) => c.id))


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find((j) => j.id === event.active.id)
    if (job) setActiveJob(job)
  }

  const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveJob(null)
        if (!over) return

        const jobId = active.id as number
        const overId = String(over.id)

        // Kalau over.id adalah valid status → drop ke kolom kosong
        // Kalau bukan → berarti drop di atas card lain, cari kolom card itu
        let newStatus: JobStatus

        if (VALID_STATUSES.has(overId as JobStatus)) {
            newStatus = overId as JobStatus
        } else {
            // over.id adalah job ID — cari job itu ada di kolom mana
            const overJob = jobs.find((j) => j.id === Number(overId))
            if (!overJob) return
            newStatus = overJob.status
        }

        const job = jobs.find((j) => j.id === jobId)
        if (job && job.status !== newStatus) {
            updateStatus({ id: jobId, status: newStatus })
        }
    }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm animate-pulse">Loading your applications...</p>
      </div>
    )
  }

  if (jobs.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      {/* Desktop — horizontal kanban */}
      <div className="hidden md:flex gap-4 h-[calc(100vh-57px)] px-4 md:px-6 pt-4 md:pt-6">
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 flex-1">
            {KANBAN_COLUMNS.map((col) => (
                <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                emoji={col.emoji}
                jobs={jobs.filter((j) => j.status === col.id)}
                />
            ))}
            </div>
            <DragOverlay>
            {activeJob && <JobCard job={activeJob} />}
            </DragOverlay>
        </DndContext>
        </div>

      {/* Mobile — accordion list */}
      <div className="md:hidden">
        <MobileBoard jobs={jobs} />
      </div>
    </>
  )
}
