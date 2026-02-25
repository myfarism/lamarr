import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"

export interface ScrapedJob {
  title: string
  company: string
  description: string
  requirements: string
  salary_min: number | null
  salary_max: number | null
  platform: string
}

export function useScrapeJob() {
  return useMutation({
    mutationFn: async (url: string): Promise<ScrapedJob> => {
      const res = await api.post("/api/ai/scrape", { url })
      return res.data.data
    },
    onError: () => toast.error("Failed to scrape job URL"),
  })
}
