"use client"

import { useState } from "react"
import { useCreateJob } from "@/lib/hooks/use-jobs"
import { useParseJob } from "@/lib/hooks/use-ai"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useScrapeJob } from "@/lib/hooks/use-scrape"

export function AddJobDialog() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"paste" | "form">("paste")
  const [rawText, setRawText] = useState("")
  const [form, setForm] = useState({
    title: "", company: "", url: "",
    platform: "", description: "",
    requirements: "", notes: "",
    salary_min: undefined as number | undefined,
    salary_max: undefined as number | undefined,
  })

  const { mutate: parseJob, isPending: isParsing } = useParseJob()
  const { mutate: createJob, isPending: isCreating } = useCreateJob()
  const { mutate: scrapeJob, isPending: isScraping } = useScrapeJob()

  const handleParse = () => {
    if (!rawText.trim()) {
      toast.error("Paste job description first")
      return
    }

    parseJob(rawText, {
      onSuccess: (parsed) => {
        setForm((prev) => ({
          ...prev,
          title: parsed.title || "",
          company: parsed.company || "",
          platform: parsed.platform || "",
          description: parsed.description || "",
          requirements: parsed.requirements || "",
          salary_min: parsed.salary_min ?? undefined,
          salary_max: parsed.salary_max ?? undefined,
        }))
        setStep("form")
        toast.success("Job parsed! Review and confirm.")
      },
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createJob(form, {
      onSuccess: () => {
        setOpen(false)
        setStep("paste")
        setRawText("")
        setForm({
          title: "", company: "", url: "", platform: "",
          description: "", requirements: "", notes: "",
          salary_min: undefined, salary_max: undefined,
        })
      },
    })
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setStep("paste")
      setRawText("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">+ Add Job</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "paste" ? "Paste job description" : "Confirm details"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1 — Paste */}
        {step === "paste" && (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Copy the full job posting and paste it below. AI will extract the details automatically.
            </p>
            <Textarea
              placeholder="Paste the full job description here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={10}
              className="resize-none font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleParse}
                disabled={isParsing}
                className="flex-1"
              >
                {isParsing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Parse with AI</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep("form")}
              >
                Manual
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Form */}
        {step === "form" && (
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
                  placeholder="linkedin, glints..."
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Job URL (AI akan scrape otomatis)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://linkedin.com/jobs/..."
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (form.url) {
                        scrapeJob(form.url, {
                          onSuccess: (parsed) => {
                            setForm({
                              ...form,
                              title: parsed.title || form.title,
                              company: parsed.company || form.company,
                              platform: parsed.platform || form.platform,
                              description: parsed.description || form.description,
                              requirements: parsed.requirements || form.requirements,
                              salary_min: parsed.salary_min ?? form.salary_min,
                              salary_max: parsed.salary_max ?? form.salary_max,
                            })
                            toast.success("Job berhasil di-scrape!")
                          },
                        })
                      }
                    }}
                    disabled={isScraping || !form.url}
                  >
                    {isScraping ? "🔍" : "Scrape"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Min Salary</Label>
                <Input
                  type="number"
                  placeholder="5000000"
                  value={form.salary_min ?? ""}
                  onChange={(e) => setForm({
                    ...form,
                    salary_min: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
              </div>
              <div className="space-y-1">
                <Label>Max Salary</Label>
                <Input
                  type="number"
                  placeholder="8000000"
                  value={form.salary_max ?? ""}
                  onChange={(e) => setForm({
                    ...form,
                    salary_max: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Requirements</Label>
              <Textarea
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                rows={3}
                placeholder="Key requirements..."
              />
            </div>

            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                placeholder="Referral, salary expectation, etc."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("paste")}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isCreating}>
                {isCreating ? "Saving..." : "Add Application"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
