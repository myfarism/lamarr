"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth.store"
import { auth } from "@/lib/firebase"

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    // Block akun email yang belum verifikasi
    // Google login selalu emailVerified = true, jadi aman
    if (!user.emailVerified) {
      auth.signOut()
      router.push("/login?unverified=true")
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

  if (!user || !user.emailVerified) return null

  return <>{children}</>
}
