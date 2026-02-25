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
import { MoreHorizontal, Trash2, ExternalLink, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JobDetailSheet } from "./job-detail-sheet"

interface Props {
  job: Job
}

export function JobCard({ job }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { mutate: deleteJob } = useDeleteJob()
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
                    onClick={() => deleteJob(job.id)}
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {job.platform && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
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
                  day: "numeric", month: "short"
                })}
              </span>
            </div>

          </CardContent>
        </Card>
      </div>

      <JobDetailSheet
        job={job}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  )
}
