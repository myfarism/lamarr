"use client"

import { useState, useMemo } from "react"
import {
  DndContext, DragEndEvent, DragOverlay,
  DragStartEvent, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core"
import { useJobs, useUpdateJobStatus, useDeleteJob } from "@/lib/hooks/use-jobs"
import { KanbanColumn } from "./kanban-column"
import { JobCard } from "./job-card"
import { Job, JobStatus, KANBAN_COLUMNS } from "@/lib/types"
import { KanbanSkeleton } from "./kanban-skeleton"
import { EmptyState } from "./empty-state"
import { SearchFilter } from "./search-filter"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Trash2, ExternalLink, Sparkles, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JobDetailSheet } from "./job-detail-sheet"
import { EditJobDialog } from "./edit-job-dialog"
import { useJobsByStatus } from "@/lib/hooks/use-jobs-by-status"
import { useIntersectionObserver } from "@/lib/hooks/use-intersection-observer"

const VALID_STATUSES = new Set(KANBAN_COLUMNS.map((c) => c.id))

function MobileColumnContent({ colId, search, filterPlatform, onMove }: {
  colId: JobStatus
  search: string
  filterPlatform: string
  onMove: (jobId: number, status: JobStatus) => void
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useJobsByStatus(colId, search, filterPlatform)

  const jobs = data?.pages.flatMap((p) => p.data) ?? []

  const loaderRef = useIntersectionObserver(
    () => { if (hasNextPage) fetchNextPage() },
    hasNextPage ?? false
  )

  return (
    <div className="max-h-64 overflow-y-auto space-y-2 p-3">
      {jobs.length === 0 && !isFetchingNextPage
        ? <p className="text-xs text-muted-foreground text-center py-4">Tidak ada lamaran</p>
        : jobs.map((job) => (
            <MobileJobCard
              key={job.id}
              job={job}
              onMove={(status) => onMove(job.id, status)}
            />
          ))
      }
      <div ref={loaderRef} className="py-1 flex justify-center">
        {isFetchingNextPage && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        )}
      </div>
    </div>
  )
}


function MobileJobCard({ job, onMove }: { job: Job; onMove: (status: JobStatus) => void }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteJob()

  const otherColumns = KANBAN_COLUMNS.filter((c) => c.id !== job.status)

  return (
    <>
      <Card className="hover:border-zinc-600 transition-colors">
        <CardContent className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0" onClick={() => setSheetOpen(true)}>
              <p className="font-medium text-sm leading-tight truncate">{job.title}</p>
              <p className="text-xs text-muted-foreground truncate">{job.company}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSheetOpen(true)}>
                  <Sparkles className="mr-2 h-3 w-3" />
                  View & Analyze
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-3 w-3" />
                  Edit
                </DropdownMenuItem>
                {job.url && (
                  <DropdownMenuItem asChild>
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Open listing
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {job.platform && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 capitalize">
                {job.platform}
              </Badge>
            )}
            {job.match_score && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 text-green-400 border-green-400/30">
                {Math.round(job.match_score * 100)}% match
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(job.applied_at).toLocaleDateString("id-ID", {
                day: "numeric", month: "short",
              })}
            </span>
          </div>

          {/* Deadline */}
          {/* {(() => {
            const dl = getDeadlineStatus(job.deadline)
            return dl ? (
              <Badge variant="outline" className={`text-xs px-1.5 py-0 ${dl.class}`}>
                ⏰ {dl.label}
              </Badge>
            ) : null
          })()} */}

          {/* Move To */}
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <span className="text-xs text-muted-foreground shrink-0">Move to:</span>
            <div className="flex gap-1 flex-wrap">
              {otherColumns.map((col) => (
                <button
                  key={col.id}
                  onClick={() => onMove(col.id)}
                  className="text-xs px-2 py-0.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-1"
                >
                  <span>{col.emoji}</span>
                  <span>{col.label}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <JobDetailSheet job={job} open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <EditJobDialog job={job} open={editOpen} onClose={() => setEditOpen(false)} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{job.title}</strong> at <strong>{job.company}</strong> will be permanently removed.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteJob(job.id)}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


function MobileBoard({ search, filterPlatform, jobs }: { search: string; filterPlatform: string; jobs: Job[] }) {
  const [expandedSet, setExpandedSet] = useState<Set<JobStatus>>(
    new Set(KANBAN_COLUMNS.map((c) => c.id)) // semua terbuka by default
  )
  const { mutate: updateStatus } = useUpdateJobStatus()

  const toggle = (colId: JobStatus) => {
    setExpandedSet((prev) => {
      const next = new Set(prev)
      if (next.has(colId)) {
        next.delete(colId)
      } else {
        next.add(colId)
      }
      return next
    })
  }

  return (
    <div className="space-y-2">
      {KANBAN_COLUMNS.map((col) => {
        const colJobs = jobs.filter((j) => j.status === col.id)
        const isOpen = expandedSet.has(col.id)
        return (
          <div key={col.id} className="rounded-lg border border-border overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-secondary/20 hover:bg-secondary/40 transition-colors"
              onClick={() => toggle(col.id)}
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
              <MobileColumnContent
                colId={col.id}
                search={search}           // ← pass dari props MobileBoard
                filterPlatform={filterPlatform} // ← pass dari props MobileBoard
                onMove={(jobId, status) => updateStatus({ id: jobId, status })}
              />
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
                search={search}
                filterPlatform={filterPlatform}
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
        <MobileBoard search={search} filterPlatform={filterPlatform} jobs={filteredJobs} />
      </div>
    </>
  )
}
