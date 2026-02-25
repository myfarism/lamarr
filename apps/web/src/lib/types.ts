export type JobStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted"

export interface Job {
  id: number
  user_id: number
  title: string
  company: string
  url?: string
  platform?: string
  status: JobStatus
  description?: string
  requirements?: string
  salary_min?: number
  salary_max?: number
  match_score?: number
  notes?: string
  applied_at: string
  deadline?: string
  created_at: string
  updated_at: string
}

export interface JobTimeline {
  id: number
  job_id: number
  stage: string
  note: string
  happened_at: string
}

export const KANBAN_COLUMNS: {
  id: JobStatus
  label: string
  emoji: string
}[] = [
  { id: "applied",   label: "Applied",    emoji: "📨" },
  { id: "screening", label: "Screening",  emoji: "🔍" },
  { id: "interview", label: "Interview",  emoji: "🎯" },
  { id: "offer",     label: "Offer",      emoji: "🎉" },
  { id: "rejected",  label: "Rejected",   emoji: "❌" },
  { id: "ghosted",   label: "Ghosted",    emoji: "👻" },
]
