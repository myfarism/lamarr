import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "firebase/auth"

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

// Custom storage untuk serialize Firebase User dengan aman
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name)
    if (!str) return null
    
    try {
      const { state } = JSON.parse(str)
      // User dari localStorage hanya untuk loading state awal
      // Firebase auth akan override dengan real user
      return {
        state: {
          ...state,
          loading: false, // Set loading false karena user ada di localStorage
        },
      }
    } catch {
      return null
    }
  },
  setItem: (name: string, value: any) => {
    const state = value.state
    // Hanya simpan field penting dari Firebase User
    const simplifiedState = {
      ...state,
      user: state.user ? {
        uid: state.user.uid,
        email: state.user.email,
        displayName: state.user.displayName,
        photoURL: state.user.photoURL,
        emailVerified: state.user.emailVerified,
      } : null,
    }
    
    localStorage.setItem(name, JSON.stringify({ state: simplifiedState }))
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name)
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "auth-storage",
      storage: customStorage,
    }
  )
)
