import { useQueryClient } from "@tanstack/react-query"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuthStore } from "@/lib/store/auth.store"

export function useLogout() {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    queryClient.clear()
  }

  return { logout }
}
