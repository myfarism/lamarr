import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { Job, JobStatus } from "@/lib/types"

const PAGE_SIZE = 10

export function useJobsByStatus(
  status: JobStatus,
  search = "",
  platform = "all"
) {
  return useInfiniteQuery({
    queryKey: ["jobs", status, search, platform],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get("/api/jobs", {
        params: {
          status,
          page: pageParam,
          limit: PAGE_SIZE,
          ...(search && { search }),
          ...(platform && platform !== "all" && { platform }),
        },
      })
      return res.data as {
        data: Job[]
        meta: { page: number; pages: number; total: number; limit: number }
      }
    },
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.meta
      return page < pages ? page + 1 : undefined
    },
    initialPageParam: 1,
  })
}
