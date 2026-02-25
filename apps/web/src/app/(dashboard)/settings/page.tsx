"use client"

import { useState, useEffect } from "react"
import { useUpdateCV } from "@/lib/hooks/use-ai"
import { useAuthStore } from "@/lib/store/auth.store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import api from "@/lib/axios"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [cvText, setCvText] = useState("")
  const { mutate: updateCV, isPending } = useUpdateCV()

  // Load existing CV
  useEffect(() => {
    api.get("/api/me").then((res) => {
      if (res.data.data?.cv_text) {
        setCvText(res.data.data.cv_text)
      }
    })
  }, [])

  const handleSave = () => {
    if (!cvText.trim()) {
      toast.error("CV text cannot be empty")
      return
    }
    updateCV(cvText)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-lg font-bold tracking-tight">Lamarr</a>
          <span className="text-xs text-muted-foreground">/ Settings</span>
        </div>
        <span className="text-sm text-muted-foreground">{user?.email}</span>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">

        <Card>
          <CardHeader>
            <CardTitle>Your CV</CardTitle>
            <CardDescription>
              Paste your CV as plain text. This is used by AI to calculate match scores and analyze job fit.
              The more detailed, the better the analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>CV Text</Label>
              <Textarea
                placeholder={`Paste your full CV here...

Example:
Your Name
Backend Developer | Node.js | Go | PostgreSQL

Experience:
  Built RESTful APIs with Node.js...

Skills:
JavaScript, TypeScript, Go, Kotlin, Python...`}
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                rows={20}
                className="font-mono text-xs resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {cvText.length} characters
                {cvText.length < 200 && cvText.length > 0 && (
                  <span className="text-yellow-500 ml-2">— too short, add more detail for better analysis</span>
                )}
              </p>
            </div>
            <Button onClick={handleSave} disabled={isPending} className="w-full">
              {isPending ? "Saving..." : "Save CV"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How AI Analysis Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <span className="text-lg">🧠</span>
              <div>
                <p className="font-medium text-foreground">Semantic Matching</p>
                <p>Your CV and job requirements are converted to embeddings using sentence-transformers. Cosine similarity measures how closely your skills match.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">🎯</span>
              <div>
                <p className="font-medium text-foreground">Gap Analysis</p>
                <p>Llama 3.3 70B reads both your CV and job requirements, identifies your strengths, gaps, and gives an honest verdict.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">📧</span>
              <div>
                <p className="font-medium text-foreground">Follow-up Email</p>
                <p>Generates a contextual follow-up email based on the position, company, and how many days since you applied.</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
