"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { sendVerificationEmail } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { MailCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showVerifyScreen, setShowVerifyScreen] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  // Kalau balik dari link verifikasi
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified! Please sign in.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, form.email, form.password)

        // Cek apakah email sudah diverifikasi
        if (!cred.user.emailVerified) {
          await auth.signOut()
          toast.error("Email belum diverifikasi", {
            description: "Cek inbox kamu dan klik link verifikasi.",
            action: {
              label: "Kirim ulang",
              onClick: async () => {
                const tempCred = await signInWithEmailAndPassword(auth, form.email, form.password)
                await sendVerificationEmail()
                await auth.signOut()
                toast.success("Email verifikasi dikirim ulang!")
              },
            },
          })
          setLoading(false)
          return
        }

        router.push("/dashboard")
      } else {
        // Register
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
        await updateProfile(cred.user, { displayName: form.name })
        await sendVerificationEmail()
        setRegisteredEmail(form.email)
        setShowVerifyScreen(true)
        await auth.signOut() // sign out dulu, tunggu verifikasi
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ""

      // Friendly error messages
      const errorMap: Record<string, string> = {
        "auth/user-not-found":     "Akun tidak ditemukan",
        "auth/wrong-password":     "Password salah",
        "auth/email-already-in-use": "Email sudah digunakan",
        "auth/weak-password":      "Password minimal 6 karakter",
        "auth/invalid-email":      "Format email tidak valid",
        "auth/too-many-requests":  "Terlalu banyak percobaan, coba lagi nanti",
        "auth/invalid-credential": "Email atau password salah",
      }

      toast.error(errorMap[code] ?? "Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      router.push("/dashboard")
    } catch (err: unknown) {
      toast.error("Google sign-in gagal, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, registeredEmail, form.password)
      await sendVerificationEmail()
      await auth.signOut()
      toast.success("Email verifikasi dikirim ulang!")
    } catch {
      toast.error("Gagal kirim ulang, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  // Screen setelah register — tunggu verifikasi
  if (showVerifyScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Cek email kamu</h2>
              <p className="text-sm text-muted-foreground">
                Link verifikasi dikirim ke
              </p>
              <p className="text-sm font-medium">{registeredEmail}</p>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              Klik link di email tersebut untuk mengaktifkan akun, lalu kembali ke sini untuk login.
            </p>
            <div className="flex flex-col gap-2 w-full mt-2">
              <Button
                onClick={() => {
                  setShowVerifyScreen(false)
                  setIsLogin(true)
                }}
                className="w-full"
              >
                Sudah verifikasi, login sekarang
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendVerification}
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim ulang email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Lamarr</h1>
          <p className="text-muted-foreground text-sm">
            Track every application. Miss nothing.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Welcome back" : "Create account"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Sign in to your Lamarr account"
                : "Start tracking your applications"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogle}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLogin && (
                <div className="space-y-1">
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    placeholder="Muhammad Faris"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required={!isLogin}
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="faris@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Loading..."
                  : isLogin ? "Sign In" : "Buat Akun"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary underline-offset-4 hover:underline"
              >
                {isLogin ? "Daftar" : "Masuk"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}