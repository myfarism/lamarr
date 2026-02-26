"use client"

import { useJobs } from "@/lib/hooks/use-jobs"
import { KANBAN_COLUMNS, Job } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { TrendingUp, Send, Clock, Trophy } from "lucide-react"
import { SmartSuggestions } from "@/components/analytics/smart-suggestions"


const STATUS_COLORS: Record<string, string> = {
  applied:   "#6366f1",
  screening: "#f59e0b",
  interview: "#3b82f6",
  offer:     "#22c55e",
  rejected:  "#ef4444",
  ghosted:   "#6b7280",
}

function getResponseRate(jobs: Job[]) {
  const total = jobs.length
  if (total === 0) return 0
  const responded = jobs.filter((j) =>
    ["screening", "interview", "offer", "rejected"].includes(j.status)
  ).length
  return Math.round((responded / total) * 100)
}

function getAvgDaysToReply(jobs: Job[]) {
  const responded = jobs.filter((j) =>
    j.status !== "applied" && j.status !== "ghosted"
  )
  if (responded.length === 0) return null

  const avg = responded.reduce((acc, job) => {
    const days = Math.abs(
      new Date().getTime() - new Date(job.applied_at).getTime()
    ) / (1000 * 60 * 60 * 24)
    return acc + days
  }, 0) / responded.length

  return Math.round(avg)
}

function getWeeklyData(jobs: Job[]) {
  const weeks: Record<string, number> = {}

  jobs.forEach((job) => {
    const date = new Date(job.applied_at)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const key = weekStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    weeks[key] = (weeks[key] || 0) + 1
  })

  return Object.entries(weeks)
    .slice(-8) // 8 minggu terakhir
    .map(([week, count]) => ({ week, count }))
}

function getPlatformData(jobs: Job[]) {
  const platforms: Record<string, number> = {}
  jobs.forEach((job) => {
    const p = job.platform || "unknown"
    platforms[p] = (platforms[p] || 0) + 1
  })
  return Object.entries(platforms)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))
}

export function AnalyticsDashboard() {
  const { data: jobs = [], isLoading } = useJobs()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm animate-pulse">Loading analytics...</p>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-4xl">📊</p>
        <p className="text-muted-foreground text-sm">Add some applications first to see analytics</p>
      </div>
    )
  }

  const responseRate = getResponseRate(jobs)
  const avgDays = getAvgDaysToReply(jobs)
  const weeklyData = getWeeklyData(jobs)
  const platformData = getPlatformData(jobs)

  const statusData = KANBAN_COLUMNS.map((col) => ({
    name: col.label,
    emoji: col.emoji,
    count: jobs.filter((j) => j.status === col.id).length,
    color: STATUS_COLORS[col.id],
  })).filter((d) => d.count > 0)

  const bestPlatform = platformData[0]?.name ?? "-"
  const offerCount = jobs.filter((j) => j.status === "offer").length
  const ghostedCount = jobs.filter((j) => j.status === "ghosted").length

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Send className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Applied</span>
            </div>
            <p className="text-2xl font-bold">{jobs.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Response Rate</span>
            </div>
            <p className={`text-2xl font-bold ${
              responseRate >= 50 ? "text-green-400" :
              responseRate >= 25 ? "text-yellow-400" : "text-red-400"
            }`}>
              {responseRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Avg Days to Reply</span>
            </div>
            <p className="text-2xl font-bold">
              {avgDays !== null ? `${avgDays}d` : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Offers</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{offerCount}</p>
          </CardContent>
        </Card>
      </div>

      <SmartSuggestions />

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Weekly applications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Applications per Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="name"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value, name) => [value, name]}
                />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform breakdown + Ghosted Graveyard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Platform */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Applications by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {platformData.map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 capitalize truncate">
                    {p.name}
                  </span>
                  <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${(p.value / jobs.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-6 text-right">{p.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ghosted Graveyard */}
        <Card className="border-zinc-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              👻 Ghosted Graveyard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ghostedCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2">
                <p className="text-3xl">🎉</p>
                <p className="text-xs text-muted-foreground">No ghosts yet. Keep it that way.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-4xl font-bold text-zinc-500">{ghostedCount}</p>
                <p className="text-xs text-muted-foreground">
                  {ghostedCount === 1
                    ? "company left you on read."
                    : `companies left you on read.`}
                </p>
                <div className="space-y-1">
                  {jobs
                    .filter((j) => j.status === "ghosted")
                    .slice(0, 3)
                    .map((j) => (
                      <div key={j.id} className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500 truncate">{j.company}</span>
                        <span className="text-xs text-zinc-600">
                          {Math.round(
                            (new Date().getTime() - new Date(j.applied_at).getTime())
                            / (1000 * 60 * 60 * 24)
                          )}d ago
                        </span>
                      </div>
                    ))}
                </div>
                <p className="text-xs text-zinc-600 italic">
                  "It's not you. It's their ATS."
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
