"use client"

import { useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuthStore } from "@/lib/store/auth.store"
import { useQueryClient } from "@tanstack/react-query"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    let previousUid: string | null = null

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Kalau user berubah (beda akun), clear semua cache
      if (previousUid && user?.uid !== previousUid) {
        queryClient.clear()
      }

      previousUid = user?.uid ?? null
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setLoading, queryClient])

  return <>{children}</>
}
