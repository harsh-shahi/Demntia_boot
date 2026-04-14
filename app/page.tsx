"use client"

import { useState, lazy, Suspense, useEffect } from "react"
import { ProgressBar } from "@/components/progress-bar"
import { Card } from "@/components/ui/card"

const WelcomeScreen = lazy(() => import("@/components/welcome-screen").then((m) => ({ default: m.WelcomeScreen })))
const ConsentScreen = lazy(() => import("@/components/consent-screen").then((m) => ({ default: m.ConsentScreen })))
const OrientationScreen = lazy(() =>
  import("@/components/orientation-screen").then((m) => ({ default: m.OrientationScreen })),
)
const MemoryTestScreen = lazy(() =>
  import("@/components/memory-test-screen").then((m) => ({ default: m.MemoryTestScreen })),
)
const DelayedRecallScreen = lazy(() =>
  import("@/components/delayed-recall-screen").then((m) => ({ default: m.DelayedRecallScreen })),
)
const ObjectNamingScreen = lazy(() =>
  import("@/components/object-naming-screen").then((m) => ({ default: m.ObjectNamingScreen })),
)
const DigitSpanScreen = lazy(() =>
  import("@/components/digit-span-screen").then((m) => ({ default: m.DigitSpanScreen })),
)
const VerbalFluencyScreen = lazy(() =>
  import("@/components/verbal-fluency-screen").then((m) => ({ default: m.VerbalFluencyScreen })),
)
const CommandScreen = lazy(() => import("@/components/command-screen").then((m) => ({ default: m.CommandScreen })))
const DrawingScreen = lazy(() => import("@/components/drawing-screen").then((m) => ({ default: m.DrawingScreen })))
const StroopScreen = lazy(() => import("@/components/stroop-screen").then((m) => ({ default: m.StroopScreen })))
const ScoreSummaryScreen = lazy(() =>
  import("@/components/score-summary-screen").then((m) => ({ default: m.ScoreSummaryScreen })),
)
const RecommendationScreen = lazy(() =>
  import("@/components/recommendation-screen").then((m) => ({ default: m.RecommendationScreen })),
)

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-lg p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </Card>
    </div>
  )
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})

  const totalSteps = 13

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }, [currentStep])

  const handleNext = (stepName?: string, score?: number) => {
    if (stepName && score !== undefined) {
      setScores((prev) => ({ ...prev, [stepName]: score }))
    }
    setCurrentStep((prev) => prev + 1)
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setScores({})
  }

  const calculateTotalScore = () => {
    return Object.values(scores).reduce((acc, val) => acc + val, 0)
  }

  return (
    <main className="min-h-screen bg-background">
      {currentStep > 0 && currentStep < totalSteps - 1 && <ProgressBar current={currentStep} total={totalSteps} />}

      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Suspense fallback={<LoadingFallback />}>
          {currentStep === 0 && <WelcomeScreen onNext={() => handleNext()} />}
          {currentStep === 1 && <ConsentScreen onNext={() => handleNext()} />}
          {currentStep === 2 && <OrientationScreen onNext={(score) => handleNext("orientation", score)} />}
          {currentStep === 3 && <MemoryTestScreen onNext={(score) => handleNext("memory", score)} />}
          {currentStep === 4 && <DigitSpanScreen onNext={(score) => handleNext("digitSpan", score)} />}
          {currentStep === 5 && <DelayedRecallScreen onNext={(score) => handleNext("recall", score)} />}
          {currentStep === 6 && <ObjectNamingScreen onNext={(score) => handleNext("naming", score)} />}
          {currentStep === 7 && <VerbalFluencyScreen onNext={(score) => handleNext("fluency", score)} />}
          {currentStep === 8 && <CommandScreen onNext={(score) => handleNext("command", score)} />}
          {currentStep === 9 && <DrawingScreen onNext={(score) => handleNext("drawing", score)} />}
          {currentStep === 10 && <StroopScreen onNext={(score) => handleNext("stroop", score)} />}
          {currentStep === 11 && <ScoreSummaryScreen totalScore={calculateTotalScore()} onNext={() => handleNext()} />}
          {currentStep === 12 && <RecommendationScreen totalScore={calculateTotalScore()} onRestart={handleRestart} />}
        </Suspense>
      </div>
    </main>
  )
}
