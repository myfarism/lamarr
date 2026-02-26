"use client"

import { useState } from "react"
import { Job } from "@/lib/types"
import { useAnalyzeJob, useFollowUpEmail, GapAnalysis } from "@/lib/hooks/use-ai"
import { useJob } from "@/lib/hooks/use-jobs"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Mail, Loader2, ExternalLink, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Calendar, Clock } from "lucide-react"

interface Props {
  job: Job | null
  open: boolean
  onClose: () => void
}

export function JobDetailSheet({ job: jobProp, open, onClose }: Props) {
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null)
  const [followUpEmail, setFollowUpEmail] = useState<string | null>(null)

  const { mutate: analyzeJob, isPending: isAnalyzing } = useAnalyzeJob()
  const { mutate: generateEmail, isPending: isGenerating } = useFollowUpEmail()
  const router = useRouter()
  const { data: jobDetail } = useJob(open && jobProp ? jobProp.id : null)

  const job = jobDetail ?? jobProp

  if (!job) return null

  const handleAnalyze = () => {
    analyzeJob(job.id, {
      onSuccess: (data) => {
        setAnalysis(data)
        toast.success("Analysis complete!")
      },
      onError: (err: unknown) => {
        if (axios.isAxiosError(err)) {
          const message = err.response?.data?.error ?? "Failed to analyze job"

          if (message.includes("CV text")) {
            toast.error("CV belum diisi", {
              description: "Upload CV kamu di halaman Settings dulu.",
              action: {
                label: "Buka Settings",
                onClick: () => router.push("/settings"),
              },
            })
            return
          }

          toast.error(message)
          return
        }
        toast.error("Failed to analyze job")
      },
    })
  }

  const handleFollowUp = () => {
    generateEmail(job.id, {
      onSuccess: (email) => {
        setFollowUpEmail(email)
      },
    })
  }

  const handleCopyEmail = () => {
    if (followUpEmail) {
      navigator.clipboard.writeText(followUpEmail)
      toast.success("Email copied!")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-left">{job.title}</SheetTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-muted-foreground text-sm">{job.company}</span>
            {job.platform && <Badge variant="secondary">{job.platform}</Badge>}
            {job.match_score && (
              <Badge variant="outline" className="text-green-400 border-green-400/30">
                {Math.round(job.match_score * 100)}% match
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">

          {/* Quick Actions */}
          <div className="flex gap-2">
            {job.url && (
              <Button variant="outline" size="sm" asChild>
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  View Listing
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing
                ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Analyzing...</>
                : <><Sparkles className="mr-1.5 h-3.5 w-3.5" /> Analyze Fit</>
              }
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFollowUp}
              disabled={isGenerating}
            >
              {isGenerating
                ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Generating...</>
                : <><Mail className="mr-1.5 h-3.5 w-3.5" /> Follow-up Email</>
              }
            </Button>
          </div>

          {/* Gap Analysis Result */}
          {analysis && (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Fit Analysis
                </span>
                <span className={`text-lg font-bold ${
                  analysis.match_percentage >= 70 ? "text-green-400" :
                  analysis.match_percentage >= 40 ? "text-yellow-400" : "text-red-400"
                }`}>
                  {analysis.match_percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    analysis.match_percentage >= 70 ? "bg-green-500" :
                    analysis.match_percentage >= 40 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${analysis.match_percentage}%` }}
                />
              </div>

              {/* Strengths */}
              <div>
                <p className="text-xs font-medium text-green-400 flex items-center gap-1 mb-2">
                  <CheckCircle className="h-3 w-3" /> Strengths
                </p>
                <ul className="space-y-1">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div>
                <p className="text-xs font-medium text-red-400 flex items-center gap-1 mb-2">
                  <AlertTriangle className="h-3 w-3" /> Gaps
                </p>
                <ul className="space-y-1">
                  {analysis.gaps.map((g, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {g}</li>
                  ))}
                </ul>
              </div>

              {/* Verdict */}
              <div className="rounded bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground italic">"{analysis.verdict}"</p>
              </div>

              {/* Suggestion */}
              <div>
                <p className="text-xs font-medium mb-1">💡 Suggestion</p>
                <p className="text-xs text-muted-foreground">{analysis.suggestion}</p>
              </div>
            </div>
          )}

          {job.timelines && job.timelines.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              📋 Riwayat Perubahan
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {job.timelines.slice().reverse().map((timeline) => (
                <div key={timeline.id} className="flex items-start gap-3 p-2 bg-secondary/30 rounded-md">
                  <div className="flex-shrink-0 w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-medium capitalize">{timeline.stage}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(timeline.happened_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </span>
                    </div>
                    {timeline.note && (
                      <p className="text-xs text-muted-foreground mt-0.5">{timeline.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

          {/* Follow-up Email */}
          {followUpEmail && (
            <div className="space-y-2 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Follow-up Draft
                </span>
                <Button variant="ghost" size="sm" onClick={handleCopyEmail}>
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {followUpEmail}
              </p>
            </div>
          )}

          {/* Job Info */}
          {job.requirements && (
            <div>
              <p className="text-xs font-medium mb-2">Requirements</p>
              <p className="text-xs text-muted-foreground">{job.requirements}</p>
            </div>
          )}

          {job.notes && (
            <div>
              <p className="text-xs font-medium mb-2">Notes</p>
              <p className="text-xs text-muted-foreground">{job.notes}</p>
            </div>
          )}

          {/* Salary */}
          {(job.salary_min || job.salary_max) && (
            <div>
              <p className="text-xs font-medium mb-1">Salary Range</p>
              <p className="text-sm">
                {job.salary_min && `Rp ${job.salary_min.toLocaleString("id-ID")}`}
                {job.salary_min && job.salary_max && " — "}
                {job.salary_max && `Rp ${job.salary_max.toLocaleString("id-ID")}`}
              </p>
            </div>
          )}

        </div>
      </SheetContent>
    </Sheet>
  )
}
