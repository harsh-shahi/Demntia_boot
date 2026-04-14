"use client"

import { useState, lazy, Suspense, useEffect, useRef } from "react"
import { ProgressBar } from "@/components/progress-bar"
import { Card } from "@/components/ui/card"
import { assessmentStorage } from "@/lib/assessment-storage"

// Lazy load components
const UserAuthScreen = lazy(() => import("@/components/user-auth-screen").then((m) => ({ default: m.UserAuthScreen })))
const WelcomeScreen = lazy(() => import("@/components/welcome-screen").then((m) => ({ default: m.WelcomeScreen })))
const ConsentScreen = lazy(() => import("@/components/consent-screen").then((m) => ({ default: m.ConsentScreen })))
const OrientationScreen = lazy(() => import("@/components/orientation-screen").then((m) => ({ default: m.OrientationScreen })))
const MemoryTestScreen = lazy(() => import("@/components/memory-test-screen").then((m) => ({ default: m.MemoryTestScreen })))
const DelayedRecallScreen = lazy(() => import("@/components/delayed-recall-screen").then((m) => ({ default: m.DelayedRecallScreen })))
const ObjectNamingScreen = lazy(() => import("@/components/object-naming-screen").then((m) => ({ default: m.ObjectNamingScreen })))
const DigitSpanScreen = lazy(() => import("@/components/digit-span-screen").then((m) => ({ default: m.DigitSpanScreen })))
const VerbalFluencyScreen = lazy(() => import("@/components/verbal-fluency-screen").then((m) => ({ default: m.VerbalFluencyScreen })))
const CommandScreen = lazy(() => import("@/components/command-screen").then((m) => ({ default: m.CommandScreen })))
const DrawingScreen = lazy(() => import("@/components/drawing-screen").then((m) => ({ default: m.DrawingScreen })))
const StroopScreen = lazy(() => import("@/components/stroop-screen").then((m) => ({ default: m.StroopScreen })))
const ScoreSummaryScreen = lazy(() => import("@/components/score-summary-screen").then((m) => ({ default: m.ScoreSummaryScreen })))
const RecommendationScreen = lazy(() => import("@/components/recommendation-screen").then((m) => ({ default: m.RecommendationScreen })))

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-lg p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Preparing assessment...</p>
        </div>
      </Card>
    </div>
  )
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [hashId, setHashId] = useState<string | null>(null)
  
  const startTimeRef = useRef<number | null>(null)
  const totalSteps = 14 
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

  // 1. Handle Voice Cancellation & Offline Sync Check
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel()

      // Check for pending data to sync once app starts
      const pendingData = localStorage.getItem("pending_sync")
      if (pendingData) {
        const syncOfflineData = async () => {
          try {
            const res = await fetch(`${baseUrl}/add-session`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: pendingData,
            })
            if (res.ok) {
              console.log("Offline data synced successfully")
              localStorage.removeItem("pending_sync")
            }
          } catch (e) {
            console.log("Still offline, waiting for next session")
          }
        }
        syncOfflineData()
      }
    }
  }, [currentStep, baseUrl])

  // 2. Sync with backend once test is done
  const syncToBackend = async (finalScore: number) => {
    const savedHashId = localStorage.getItem("userHashId")
    if (!savedHashId || savedHashId === "guest_mode") return

    const timeTaken = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0

    const sessionData = {
      hashId: savedHashId,
      score: finalScore,
      data: {
        timeTaken: timeTaken,
        testType: "MoCA-Digital-v1",
        answers: Object.keys(scores)
      }
    }

    try {
      const res = await fetch(`${baseUrl}/add-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      })
      if (!res.ok) throw new Error("Sync failed")
    } catch (err) {
      console.error("Sync failed, saving locally for later retry")
      localStorage.setItem("pending_sync", JSON.stringify(sessionData))
    }
  }

  const handleNext = (stepName?: string, score?: number) => {
    if (stepName && score !== undefined) {
      setScores((prev) => ({ ...prev, [stepName]: score }))
    }

    if (currentStep === 0) {
      startTimeRef.current = Date.now()
    }

    // Sync when moving from Summary (12) to Recommendation (13)
    if (currentStep === 12) {
      const finalScore = Math.round(Object.values(scores).reduce((acc, val) => acc + val, 0))
      syncToBackend(finalScore)
    }

    setCurrentStep((prev) => prev + 1)
  }

  const handleRestart = () => {
    setCurrentStep(1) 
    setScores({})
    assessmentStorage.clear()
    startTimeRef.current = Date.now()
  }

  const calculateTotalScore = () => {
    return Math.round(Object.values(scores).reduce((acc, val) => acc + val, 0))
  }

  return (
    <main className="min-h-screen bg-background">
      {currentStep > 1 && currentStep < totalSteps - 1 && (
        <ProgressBar current={currentStep - 1} total={totalSteps - 2} />
      )}

      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Suspense fallback={<LoadingFallback />}>
          {currentStep === 0 && (
            <UserAuthScreen onAuthenticated={(id) => { setHashId(id); handleNext(); }} />
          )}

          {currentStep === 1 && <WelcomeScreen onNext={() => handleNext()} />}
          {currentStep === 2 && <ConsentScreen onNext={() => handleNext()} />}
          {currentStep === 3 && <OrientationScreen onNext={(s) => handleNext("orientation", s)} />}
          {currentStep === 4 && <MemoryTestScreen onNext={(s) => handleNext("memory", s)} />}
          {currentStep === 5 && <DigitSpanScreen onNext={(s) => handleNext("digitSpan", s)} />}
          {currentStep === 6 && <DelayedRecallScreen onNext={(s) => handleNext("recall", s)} />}
          {currentStep === 7 && <ObjectNamingScreen onNext={(s) => handleNext("naming", s)} />}
          {currentStep === 8 && <VerbalFluencyScreen onNext={(s) => handleNext("fluency", s)} />}
          {currentStep === 9 && <CommandScreen onNext={(s) => handleNext("command", s)} />}
          {currentStep === 10 && <DrawingScreen onNext={(s) => handleNext("drawing", s)} />}
          {currentStep === 11 && <StroopScreen onNext={(s) => handleNext("stroop", s)} />}

          {currentStep === 12 && (
            <ScoreSummaryScreen 
              totalScore={calculateTotalScore()} 
              onNext={() => handleNext()} 
            />
          )}

          {currentStep === 13 && (
            <RecommendationScreen 
              totalScore={calculateTotalScore()} 
              onRestart={handleRestart} 
            />
          )}
        </Suspense>
      </div>
    </main>
  )
}