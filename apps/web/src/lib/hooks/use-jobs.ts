import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { Job, JobStatus } from "@/lib/types"

export function useJobs() {
  return useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await api.get("/api/jobs")
      return res.data.data
    },
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Job>) => {
      const res = await api.post("/api/jobs", data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success("Job added!")
    },
    onError: () => {
      toast.error("Failed to add job")
    },
  })
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, note }: { id: number; status: JobStatus; note?: string }) => {
      const res = await api.patch(`/api/jobs/${id}/status`, { status, note })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
    },
    onError: () => {
      toast.error("Failed to update status")
    },
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/jobs/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success("Job removed")
    },
  })
}
