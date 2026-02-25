import { Skeleton } from "@/components/ui/skeleton"
import { KANBAN_COLUMNS } from "@/lib/types"

export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 flex-1">
      {KANBAN_COLUMNS.map((col) => (
        <div key={col.id} className="flex flex-col flex-1 min-w-[200px] gap-3">
          <div className="flex items-center justify-between px-1 pb-3">
            <div className="flex items-center gap-2">
              <span>{col.emoji}</span>
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="flex flex-col gap-2 flex-1 rounded-lg p-2 bg-secondary/20">
            {col.id === "applied" && (
              <>
                <Skeleton className="h-[72px] w-full rounded-lg" />
                <Skeleton className="h-[72px] w-full rounded-lg" />
                <Skeleton className="h-[72px] w-full rounded-lg" />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
