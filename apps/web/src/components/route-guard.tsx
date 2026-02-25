"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth.store"

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm animate-pulse">
          Loading Lamarr...
        </div>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
