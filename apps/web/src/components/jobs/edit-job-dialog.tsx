"use client"

import { useState, useEffect } from "react"
import { Job } from "@/lib/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  job: Job
  open: boolean
  onClose: () => void
}

export function EditJobDialog({ job, open, onClose }: Props) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: "",
    company: "",
    url: "",
    platform: "",
    requirements: "",
    notes: "",
    salary_min: "" as string | number,
    salary_max: "" as string | number,
  })

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title,
        company: job.company,
        url: job.url || "",
        platform: job.platform || "",
        requirements: job.requirements || "",
        notes: job.notes || "",
        salary_min: job.salary_min ?? "",
        salary_max: job.salary_max ?? "",
      })
    }
  }, [job])

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await api.patch(`/api/jobs/${job.id}`, {
        ...data,
        platform: data.platform.toLowerCase().trim(),
        salary_min: data.salary_min !== "" ? Number(data.salary_min) : null,
        salary_max: data.salary_max !== "" ? Number(data.salary_max) : null,
      })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success("Job updated!")
      onClose()
    },
    onError: () => toast.error("Failed to update job"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(form)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Job Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Company *</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Platform</Label>
              <Input
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                placeholder="linkedin, glints..."
              />
            </div>
            <div className="space-y-1">
              <Label>Job URL</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Min Salary</Label>
              <Input
                type="number"
                value={form.salary_min}
                onChange={(e) => setForm({ ...form, salary_min: e.target.value })}
                placeholder="5000000"
              />
            </div>
            <div className="space-y-1">
              <Label>Max Salary</Label>
              <Input
                type="number"
                value={form.salary_max}
                onChange={(e) => setForm({ ...form, salary_max: e.target.value })}
                placeholder="8000000"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Requirements</Label>
            <Textarea
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
