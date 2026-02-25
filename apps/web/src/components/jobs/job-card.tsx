"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Job } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDeleteJob } from "@/lib/hooks/use-jobs"
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

interface Props {
  job: Job
}

function getDeadlineStatus(deadline?: string) {
  if (!deadline) return null
  const days = Math.ceil(
    (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  if (days < 0)  return { label: "Expired", class: "text-red-500 border-red-500/30" }
  if (days === 0) return { label: "Hari ini!", class: "text-red-400 border-red-400/30" }
  if (days <= 3)  return { label: `${days}h lagi`, class: "text-orange-400 border-orange-400/30" }
  if (days <= 7)  return { label: `${days}h lagi`, class: "text-yellow-400 border-yellow-400/30" }
  return { label: `${days}h lagi`, class: "text-muted-foreground border-border" }
}

export function JobCard({ job }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteJob()

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card className="cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-colors">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div
                className="flex-1 min-w-0"
                {...listeners}
                onClick={() => setSheetOpen(true)}
              >
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
            {(() => {
              const dl = getDeadlineStatus(job.deadline)
              return dl ? (
                <Badge variant="outline" className={`text-xs px-1.5 py-0 ${dl.class}`}>
                  ⏰ {dl.label}
                </Badge>
              ) : null
            })()}
          </CardContent>
        </Card>
      </div>

      <JobDetailSheet
        job={job}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      <EditJobDialog
        job={job}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />

      {/* Delete Confirmation */}
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
