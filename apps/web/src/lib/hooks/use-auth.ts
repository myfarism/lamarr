import { useQueryClient } from "@tanstack/react-query"
import {
  signOut,
  sendEmailVerification,
  ActionCodeSettings,
} from "firebase/auth"
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

export async function sendVerificationEmail() {
  const user = auth.currentUser
  if (!user) return

  const actionCodeSettings: ActionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_APP_URL}/login?verified=true`,
    handleCodeInApp: false,
  }

  await sendEmailVerification(user, actionCodeSettings)
}
