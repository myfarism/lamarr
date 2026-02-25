"use client"

import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JobStatus, KANBAN_COLUMNS } from "@/lib/types"

interface Props {
  search: string
  onSearchChange: (val: string) => void
  filterStatus: JobStatus | "all"
  onFilterChange: (val: JobStatus | "all") => void
  filterPlatform: string
  onPlatformChange: (val: string) => void
  platforms: string[]
  totalResults: number
}

export function SearchFilter({
  search, onSearchChange,
  filterStatus, onFilterChange,
  filterPlatform, onPlatformChange,
  platforms, totalResults,
}: Props) {
  const hasActiveFilter = search || filterStatus !== "all" || filterPlatform !== "all"

  const handleReset = () => {
    onSearchChange("")
    onFilterChange("all")
    onPlatformChange("all")
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Cari posisi atau perusahaan..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Filter Status */}
      <Select value={filterStatus} onValueChange={(v) => onFilterChange(v as JobStatus | "all")}>
        <SelectTrigger className="h-9 w-full sm:w-[160px] text-sm">
          <SelectValue placeholder="Semua status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua status</SelectItem>
          {KANBAN_COLUMNS.map((col) => (
            <SelectItem key={col.id} value={col.id}>
              {col.emoji} {col.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filter Platform */}
      {platforms.length > 0 && (
        <Select value={filterPlatform} onValueChange={onPlatformChange}>
          <SelectTrigger className="h-9 w-full sm:w-[160px] text-sm">
            <SelectValue placeholder="Semua platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua platform</SelectItem>
            {platforms.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Reset + count */}
      <div className="flex items-center gap-2 shrink-0">
        {hasActiveFilter && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 px-2">
            <X className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        )}
        {hasActiveFilter && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {totalResults} hasil
          </span>
        )}
      </div>
    </div>
  )
}
