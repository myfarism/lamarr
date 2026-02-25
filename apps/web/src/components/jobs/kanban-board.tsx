"use client"

import { useState, useMemo } from "react"
import {
  DndContext, DragEndEvent, DragOverlay,
  DragStartEvent, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core"
import { useJobs, useUpdateJobStatus } from "@/lib/hooks/use-jobs"
import { KanbanColumn } from "./kanban-column"
import { JobCard } from "./job-card"
import { Job, JobStatus, KANBAN_COLUMNS } from "@/lib/types"
import { KanbanSkeleton } from "./kanban-skeleton"
import { EmptyState } from "./empty-state"
import { SearchFilter } from "./search-filter"

const VALID_STATUSES = new Set(KANBAN_COLUMNS.map((c) => c.id))

function MobileBoard({ jobs }: { jobs: Job[] }) {
  const [expanded, setExpanded] = useState<JobStatus | null>("applied")
  const { mutate: updateStatus } = useUpdateJobStatus()
  const { ChevronDown } = require("lucide-react")
  const { Badge } = require("@/components/ui/badge")

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
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {colJobs.length}
                </span>
              </div>
              <svg
                className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="p-3 space-y-2">
                {colJobs.length === 0
                  ? <p className="text-xs text-muted-foreground text-center py-4">Tidak ada lamaran</p>
                  : colJobs.map((job) => <JobCard key={job.id} job={job} />)
                }
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

  // Search & filter state
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<JobStatus | "all">("all")
  const [filterPlatform, setFilterPlatform] = useState("all")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // Unique platforms dari semua jobs
  const platforms = useMemo(() => {
    const set = new Set(jobs.map((j) => j.platform).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [jobs])

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch = !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === "all" || job.status === filterStatus
      const matchPlatform = filterPlatform === "all" || job.platform === filterPlatform
      return matchSearch && matchStatus && matchPlatform
    })
  }, [jobs, search, filterStatus, filterPlatform])

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

    let newStatus: JobStatus
    if (VALID_STATUSES.has(overId as JobStatus)) {
      newStatus = overId as JobStatus
    } else {
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
      <div className="hidden md:flex gap-4 h-[calc(100vh-57px)] px-4 md:px-6 pt-4 md:pt-6">
        <KanbanSkeleton />
      </div>
    )
  }

  if (jobs.length === 0) return <EmptyState />

  const isFiltering = search || filterStatus !== "all" || filterPlatform !== "all"

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex flex-col h-[calc(100vh-57px)] px-4 md:px-6 pt-4">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          filterPlatform={filterPlatform}
          onPlatformChange={setFilterPlatform}
          platforms={platforms}
          totalResults={filteredJobs.length}
        />
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 flex-1 min-h-0 pb-4">
            {KANBAN_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                emoji={col.emoji}
                jobs={filteredJobs.filter((j) => j.status === col.id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeJob && <JobCard job={activeJob} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Mobile */}
      <div className="md:hidden p-4 space-y-3">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          filterPlatform={filterPlatform}
          onPlatformChange={setFilterPlatform}
          platforms={platforms}
          totalResults={filteredJobs.length}
        />
        <MobileBoard jobs={filteredJobs} />
      </div>
    </>
  )
}
