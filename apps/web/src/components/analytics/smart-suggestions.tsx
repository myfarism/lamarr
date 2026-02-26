"use client"

import { useJobs } from "@/lib/hooks/use-jobs"
import { Job } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Lightbulb, AlertTriangle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

function getSmartSuggestions(jobs: Job[]) {
  const suggestions = []

  // 1. Platform terbaik
  const platforms = {} as Record<string, number>
  jobs.forEach(job => {
    if (job.platform) platforms[job.platform] = (platforms[job.platform] || 0) + 1
  })
  const bestPlatform = Object.entries(platforms)
    .sort((a, b) => b[1] - a[1])[0]
  if (bestPlatform && bestPlatform[1] > 1) {
    suggestions.push({
      icon: TrendingUp,
      title: "Platform Terbaik",
      message: `Fokus ke ${bestPlatform[0].toUpperCase()} — ${bestPlatform[1]} lamaran.`,
      priority: "success" as const
    })
  }

  // 2. Follow-up reminder
  const needsFollowUp = jobs.filter(job => 
    job.status === "applied" && 
    new Date().getTime() - new Date(job.applied_at).getTime() > 7 * 24 * 60 * 60 * 1000
  )
  if (needsFollowUp.length > 0) {
    suggestions.push({
      icon: Lightbulb,
      title: "Follow-up Reminder",
      message: `${needsFollowUp.length} lamaran perlu follow-up (lebih dari 7 hari).`,
      priority: "warning" as const
    })
  }

  // 3. Applied terlalu lama
  const stalled = jobs.filter(job => 
    job.status === "applied" &&
    new Date().getTime() - new Date(job.applied_at).getTime() > 14 * 24 * 60 * 60 * 1000
  )
  if (stalled.length > 0) {
    suggestions.push({
      icon: AlertTriangle,
      title: "Lamaran Stagnan",
      message: `${stalled.length} lamaran applied > 2 minggu, pertimbangkan mark sebagai ghosted.`,
      priority: "destructive" as const
    })
  }

  return suggestions
}

export function SmartSuggestions() {
  const { data: jobs = [] } = useJobs()
  const suggestions = getSmartSuggestions(jobs)

  if (suggestions.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          💡 Saran Pintar
        </h3>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map((suggestion, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
            <suggestion.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
              suggestion.priority === "success" ? "text-green-500" :
              suggestion.priority === "warning" ? "text-yellow-500" :
              "text-red-500"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{suggestion.title}</p>
              <p className="text-xs text-muted-foreground">{suggestion.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
