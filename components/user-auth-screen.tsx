"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { User, Mail, Calendar, ArrowRight, Loader2, ShieldCheck } from "lucide-react"

interface UserAuthScreenProps {
  onAuthenticated: (hashId: string) => void
}

export function UserAuthScreen({ onAuthenticated }: UserAuthScreenProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Use the environment variable from your .env.local file
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

  const handleAuth = async () => {
    setLoading(true)
    setError("")

    try {
      // 1. Attempt Login using the dynamic baseUrl
      const loginRes = await fetch(`${baseUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const loginData = await loginRes.json()

      if (loginRes.ok) {
        localStorage.setItem("userHashId", loginData.hashId)
        onAuthenticated(loginData.hashId)
      } else {
        // 2. Login failed (User doesn't exist), attempt Signup
        const signupRes = await fetch(`${baseUrl}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        const signupData = await signupRes.json()

        if (signupRes.ok) {
          localStorage.setItem("userHashId", signupData.hashId)
          onAuthenticated(signupData.hashId)
        } else {
          setError(signupData.message || "Authentication failed. Please check your details.")
        }
      }
    } catch (err) {
      console.error("Auth Error:", err)
      setError(`Connection failed. Ensure backend is running at ${baseUrl}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2 bg-white">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <ShieldCheck className="w-12 h-12 text-primary" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Get Started</h2>
          <p className="text-muted-foreground mt-2">
            Please enter your details to track your cognitive health.
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-12 h-14 rounded-2xl border-2 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-12 h-14 rounded-2xl border-2 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="pl-12 h-14 rounded-2xl border-2 focus-visible:ring-primary"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <Button
            onClick={handleAuth}
            disabled={loading || !formData.name || !formData.email || !formData.dob}
            className="w-full h-20 text-2xl rounded-2xl shadow-lg mt-4 group"
          >
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}