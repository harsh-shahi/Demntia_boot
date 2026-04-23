"use client"

import { Button } from "@/components/ui/button"
import { Brain, Sparkles, Volume2, Smartphone, ArrowRight, QrCode, Lock, UserCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface WelcomeScreenProps {
  onNext: () => void
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const [isMounted, setIsMounted] = useState(true)
  const [showAppPrompt, setShowAppPrompt] = useState(false)
  const [step, setStep] = useState<"download" | "connect">("download")
  
  // User Data States
  const [userName, setUserName] = useState<string | null>(null)
  const [userHash, setUserHash] = useState("")
  const [actualOtp, setActualOtp] = useState("")
  const [userOtpInput, setUserOtpInput] = useState("")
  const [isError, setIsError] = useState(false)

  const downloadUrl = process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL || "#"

  // Logic to prevent accidental refresh/data loss
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "Are you sure? Refreshing will log you out and reset progress."
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    // 1. Check Session Storage first (Persists until tab closes)
    const sessionName = sessionStorage.getItem("userName")
    const sessionHash = sessionStorage.getItem("userHashId")

    // 2. Fallback to Local Storage if session is empty
    const savedHash = sessionHash || localStorage.getItem("userHashId") || "guest12"
    const savedName = sessionName || localStorage.getItem("userName") || "User"

    setUserHash(savedHash)
    setUserName(savedName)

    // 3. Keep it in Session Storage for the current tab session
    sessionStorage.setItem("userName", savedName)
    sessionStorage.setItem("userHashId", savedHash)

    if (savedHash.length >= 2) {
      setActualOtp(savedHash.slice(-2))
    }

    return () => {
      setIsMounted(false)
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleVerifyAndContinue = () => {
    // Case-insensitive check to be safe, though forced to lowercase in Input
    if (userOtpInput.trim().toLowerCase() === actualOtp.toLowerCase()) {
      onNext()
    } else {
      setIsError(true)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] text-center animate-bounce-in">
      
      {/* Top Right User Badge */}
      {userName && (
        <div className="absolute top-[-40px] right-0 md:top-0 flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-border animate-in fade-in slide-in-from-right-4">
          <UserCircle className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Logged in as <span className="text-primary font-bold">{userName}</span>
          </span>
        </div>
      )}

      <div className="relative mb-8">
        <div className="w-32 h-32 bg-primary rounded-3xl flex items-center justify-center shadow-lg relative animate-pulse">
          <Brain className="w-16 h-16 text-primary-foreground" strokeWidth={2.5} />
          <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{"Let's check your memory!"}</h1>
      
      <div className="space-y-4">
        <Button
          onClick={() => setShowAppPrompt(true)}
          size="lg"
          className="h-20 text-2xl px-12 rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          Start Your Check
        </Button>
      </div>

      <Dialog open={showAppPrompt} onOpenChange={(open) => {
        setShowAppPrompt(open)
        if(!open) {
            setStep("download")
            setUserOtpInput("")
            setIsError(false)
        }
      }}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-hidden p-0">
          
          {step === "download" ? (
            <div className="p-8">
              <DialogHeader className="items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Smartphone className="w-12 h-12 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-bold">Better Accuracy</DialogTitle>
                <DialogDescription className="text-lg">
                  Connect your mobile app to add <strong>Fog Data</strong> to this check.
                </DialogDescription>
              </DialogHeader>

              <div className="py-8 space-y-4">
                <Button 
                   asChild
                   className="w-full h-20 text-2xl rounded-2xl shadow-md cursor-pointer"
                >
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer">Download App</a>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setStep("connect")} 
                  className="w-full h-14 rounded-xl text-lg border-2"
                >
                  I already have the app
                </Button>
              </div>

              <DialogFooter>
                <Button 
                  onClick={() => setStep("connect")} 
                  className="w-full h-16 bg-green-600 hover:bg-green-700 text-white text-xl rounded-2xl"
                >
                  Connect & Continue <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="p-8">
              <DialogHeader className="items-center text-center">
                <div className="bg-green-100 p-3 rounded-full mb-2">
                  <QrCode className="w-8 h-8 text-green-600" />
                </div>
                <DialogTitle className="text-2xl font-bold">Scan to Sync</DialogTitle>
                <DialogDescription>
                  Enter the 2-digit code shown in your app after scanning.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center py-6">
                <div className="p-4 bg-white rounded-2xl shadow-inner border mb-8">
                  <QRCodeSVG value={userHash} size={180} />
                </div>

                <div className="w-full max-w-[200px] space-y-3">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-widest">App Code</span>
                  </div>
                  
                  <Input 
                    type="text"
                    maxLength={2}
                    placeholder="--"
                    value={userOtpInput}
                    onChange={(e) => {
                        setIsError(false);
                        // Changed to lowerCase because your hash is lowercase
                        setUserOtpInput(e.target.value.toLowerCase());
                    }}
                    className={`h-20 text-center text-4xl font-bold tracking-widest rounded-2xl border-2 transition-colors ${
                        isError ? "border-red-500 bg-red-50" : "border-primary/20 focus:border-primary"
                    }`}
                  />
                  {isError && (
                    <p className="text-red-500 text-sm font-medium text-center">
                      Code mismatch. Try again.
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button 
                  onClick={handleVerifyAndContinue} 
                  disabled={userOtpInput.length < 2}
                  className="w-full h-16 text-xl rounded-2xl bg-primary shadow-lg"
                >
                  Verify & Start Test
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}