"use client"

import { AddJobDialog } from "./add-job-dialog"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center px-4">
      <div className="text-6xl">🚀</div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Start tracking your applications</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Add your first job application. Paste the job description and let AI parse it automatically.
        </p>
      </div>
      <AddJobDialog />
      <div className="mt-4 grid grid-cols-3 gap-4 max-w-sm w-full">
        {[
          { emoji: "📋", label: "Paste job posting" },
          { emoji: "🤖", label: "AI extracts details" },
          { emoji: "📊", label: "Track & analyze" },
        ].map((step) => (
          <div key={step.label} className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">{step.emoji}</span>
            <span className="text-xs text-muted-foreground">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
