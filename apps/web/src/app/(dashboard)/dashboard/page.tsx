"use client"

import { useState } from "react"
import { KanbanBoard } from "@/components/jobs/kanban-board"
import { AddJobDialog } from "@/components/jobs/add-job-dialog"
import { useAuthStore } from "@/lib/store/auth.store"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, BarChart2, Layout } from "lucide-react"
import Link from "next/link"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { useLogout } from "@/lib/hooks/use-auth"

type View = "board" | "analytics"

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [view, setView] = useState<View>("board")
  const { logout } = useLogout()


  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Navbar */}
      <header className="border-b border-border px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">Lamarr</h1>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Job Application Tracker
          </span>
        </div>

        {/* View Toggle — desktop */}
        <div className="hidden sm:flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
          <button
            onClick={() => setView("board")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "board"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layout className="h-3.5 w-3.5" />
            Board
          </button>
          <button
            onClick={() => setView("analytics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "analytics"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Analytics
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden lg:block">
            {user?.displayName || user?.email}
          </span>
          <AddJobDialog />
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile View Toggle */}
      <div className="sm:hidden flex border-b border-border">
        <button
          onClick={() => setView("board")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors border-b-2 ${
            view === "board"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground"
          }`}
        >
          <Layout className="h-3.5 w-3.5" /> Board
        </button>
        <button
          onClick={() => setView("analytics")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors border-b-2 ${
            view === "analytics"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground"
          }`}
        >
          <BarChart2 className="h-3.5 w-3.5" /> Analytics
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {view === "board"
          ? <KanbanBoard />
          : (
            <div className="h-full overflow-y-auto p-4 md:p-6">
              <AnalyticsDashboard />
            </div>
          )
        }
      </main>

    </div>
  )
}
