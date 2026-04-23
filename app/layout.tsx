import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// Import a client-side wrapper for the logic
import { ClientLifecycle } from "@/components/ClientLifecycle" 

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Memory Check - Friendly Cognitive Screening",
  description: "A friendly, accessible cognitive screening tool",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* All client logic (Refresh warning + Auth hydration) goes here */}
        <ClientLifecycle /> 
        
        {children}
        <Analytics />
      </body>
    </html>
  )
}