import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/providers"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lamarr — Job Application Tracker",
  description: "Track your job applications intelligently",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}

