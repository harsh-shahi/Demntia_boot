"use client"

import { Button } from "@/components/ui/button"
import { Brain, Sparkles, Smartphone, ArrowRight, QrCode, Lock, UserCircle, History, X, Loader2 } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Session {
  sessionId: string
  score: number
  createdAt: string
  data: { timeTaken: number; testType: string }
}

interface WelcomeScreenProps {
  onNext: () => void
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const [showAppPrompt, setShowAppPrompt] = useState(false)
  const [step, setStep] = useState<"download" | "connect">("download")
  const [showHistory, setShowHistory] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [userName, setUserName] = useState<string | null>(null)
  const [userHash, setUserHash] = useState("")
  const [actualOtp, setActualOtp] = useState("")
  const [userOtpInput, setUserOtpInput] = useState("")
  const [isError, setIsError] = useState(false)
  
  // Polling reference to clear it when dialog closes
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const downloadUrl = process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL || "#"

  useEffect(() => {
    const savedHash = sessionStorage.getItem("userHashId") || localStorage.getItem("userHashId") || "guest12"
    const savedName = sessionStorage.getItem("userName") || localStorage.getItem("userName") || "User"
    setUserHash(savedHash)
    setUserName(savedName)
    if (savedHash.length >= 2) setActualOtp(savedHash.slice(-2))

    return () => stopPolling()
  }, [])

  // --- Pairing & Polling Logic ---
  
  const startPairingFlow = async () => {
    setStep("connect")
    try {
      // 1. Register the hash for pairing
      await fetch(`https://qr.sevasmriti.tech/api/code/save?pairKey=${userHash}`)
      
      // 2. Start Polling
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`https://qr.sevasmriti.tech/api/code/get?pairKey=${userHash}`)
          const data = await res.json()
          
          // If value becomes "0", skip verification and go next
          if (data.success && data.exists && data.value === "0") {
            stopPolling()
            onNext() 
          }
        } catch (e) {
          console.error("Polling error", e)
        }
      }, 2000)
    } catch (e) {
      console.error("Failed to initiate pairing", e)
    }
  }

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  // --- History & Auth ---

  const fetchHistory = async () => {
    setLoadingHistory(true)
    setShowHistory(true)
    try {
      const response = await fetch(`https://sevasmriti.onrender.com/api/users/${userHash}`)
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error("Failed to fetch history", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleVerifyAndContinue = () => {
    if (userOtpInput.trim().toLowerCase() === actualOtp.toLowerCase()) {
      stopPolling()
      onNext()
    } else {
      setIsError(true)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] text-center animate-bounce-in">
      {userName && (
        <div className="absolute top-[-40px] right-0 md:top-0 flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-border">
          <UserCircle className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">Logged in as <span className="text-primary font-bold">{userName}</span></span>
        </div>
      )}

      <div className="relative mb-8">
        <div className="w-32 h-32 bg-primary rounded-3xl flex items-center justify-center shadow-lg relative animate-pulse">
          <Brain className="w-16 h-16 text-primary-foreground" strokeWidth={2.5} />
          <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">{"Let's check your memory!"}</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button onClick={() => setShowAppPrompt(true)} size="lg" className="h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform">
          Start Your Check
        </Button>
        <Button onClick={fetchHistory} variant="secondary" size="lg" className="h-20 text-2xl rounded-2xl shadow-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200 border">
          <History className="mr-2 w-6 h-6" /> History
        </Button>
      </div>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-6">
          <DialogHeader className="relative">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2"><History className="text-indigo-600" /> Assessment History</DialogTitle>
            <DialogClose className="absolute right-[-10px] top-[-10px] rounded-full p-2 bg-secondary"><X className="w-5 h-5" /></DialogClose>
          </DialogHeader>
          <div className="mt-4 max-h-[400px] overflow-y-auto">
            {loadingHistory ? (
              <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /><p>Fetching records...</p></div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No past records found.</div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase text-xs font-bold">
                    <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Time</th><th className="px-4 py-3 text-right">Score</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {sessions.map((s, i) => (
                      <tr key={s.sessionId} className="hover:bg-muted/50">
                        <td className="px-4 py-4"><b>#{sessions.length - i}</b><div className="text-xs">{new Date(s.createdAt).toLocaleDateString()}</div></td>
                        <td className="px-4 py-4 text-muted-foreground">{Math.floor(s.data.timeTaken / 60)}m {s.data.timeTaken % 60}s</td>
                        <td className="px-4 py-4 text-right font-bold text-indigo-600">{s.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Connect Dialog */}
      <Dialog open={showAppPrompt} onOpenChange={(open) => {
        setShowAppPrompt(open)
        if(!open) { stopPolling(); setStep("download"); setUserOtpInput(""); setIsError(false); }
      }}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-hidden p-0">
          {step === "download" ? (
            <div className="p-8">
              <DialogHeader className="items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4"><Smartphone className="w-12 h-12 text-primary" /></div>
                <DialogTitle className="text-2xl font-bold">Better Accuracy</DialogTitle>
                <DialogDescription className="text-lg">Connect mobile app for <strong>Fog Data</strong>.</DialogDescription>
              </DialogHeader>
              <div className="py-8 space-y-4">
                <Button asChild className="w-full h-20 text-2xl rounded-2xl"><a href={downloadUrl} target="_blank">Download App</a></Button>
                <Button variant="outline" onClick={startPairingFlow} className="w-full h-14 rounded-xl text-lg border-2">I already have the app</Button>
              </div>
              <DialogFooter>
                <Button onClick={startPairingFlow} className="w-full h-16 bg-green-600 hover:bg-green-700 text-white text-xl rounded-2xl">Connect & Continue <ArrowRight className="ml-2 w-6 h-6" /></Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="p-8 text-center">
              <DialogHeader className="items-center">
                <div className="bg-green-100 p-3 rounded-full mb-2"><QrCode className="w-8 h-8 text-green-600" /></div>
                <DialogTitle className="text-2xl font-bold">Scan to Sync</DialogTitle>
                <DialogDescription>Scanning will automatically pair your device.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center py-6">
                <div className="p-4 bg-white rounded-2xl shadow-inner border mb-8"><QRCodeSVG value={userHash} size={180} /></div>
                <div className="w-full max-w-[200px]">
                  <Input 
                      type="text" maxLength={2} placeholder="--" value={userOtpInput}
                      onChange={(e) => { setIsError(false); setUserOtpInput(e.target.value.toLowerCase()); }}
                      className={`h-20 text-center text-4xl font-bold rounded-2xl border-2 ${isError ? "border-red-500 bg-red-50" : "border-primary/20"}`}
                  />
                  {isError && <p className="text-red-500 text-sm mt-2">Code mismatch.</p>}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleVerifyAndContinue} disabled={userOtpInput.length < 2} className="w-full h-16 text-xl rounded-2xl">Verify & Start</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}