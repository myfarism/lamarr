import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"

export interface ParsedJob {
  title: string
  company: string
  description: string
  requirements: string
  salary_min: number | null
  salary_max: number | null
  platform: string
}

export interface GapAnalysis {
  match_percentage: number
  strengths: string[]
  gaps: string[]
  suggestion: string
  verdict: string
}

export function useParseJob() {
  return useMutation({
    mutationFn: async (text: string): Promise<ParsedJob> => {
      const res = await api.post("/api/ai/parse-job", { text })
      return res.data.data
    },
    onError: () => toast.error("Failed to parse job description"),
  })
}

export function useAnalyzeJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (jobId: number): Promise<GapAnalysis> => {
      const res = await api.post(`/api/ai/analyze/${jobId}`)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
    },
  })
}

export function useFollowUpEmail() {
  return useMutation({
    mutationFn: async (jobId: number): Promise<string> => {
      const res = await api.post(`/api/ai/follow-up/${jobId}`)
      return res.data.data.email
    },
    onError: () => toast.error("Failed to generate email"),
  })
}

export function useUpdateCV() {
  return useMutation({
    mutationFn: async (cvText: string) => {
      await api.patch("/api/me/cv", { cv_text: cvText })
    },
    onSuccess: () => toast.success("CV saved!"),
    onError: () => toast.error("Failed to save CV"),
  })
}
