"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Timer, Volume2, Mic } from "lucide-react"
import { useAudioRecorder } from "@/lib/use-audio-recorder"
import { playBeep } from "@/lib/play-beep"

interface VerbalFluencyScreenProps {
  onNext: (score: number) => void
}

export function VerbalFluencyScreen({ onNext }: VerbalFluencyScreenProps) {
  const [stage, setStage] = useState<"instruction" | "preparing" | "active" | "complete">("instruction")
  const [timeLeft, setTimeLeft] = useState(20)
  const [wordCount, setWordCount] = useState(0)
  const { isRecording, startRecording, stopRecording, audioBlob } = useAudioRecorder()
  const [isMounted, setIsMounted] = useState(true)

  const speak = (text: string) => {
    return new Promise<void>((resolve) => {
      if ("speechSynthesis" in window && isMounted) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.lang = "en-US"
        utterance.onend = () => resolve()
        window.speechSynthesis.speak(utterance)
      } else {
        resolve()
      }
    })
  }

  useEffect(() => {
    setIsMounted(true)
    if (stage === "instruction") {
      speak("Name as many kitchen items as you can in 20 seconds.")
    }
    return () => {
      setIsMounted(false)
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (stage === "active" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (stage === "active" && timeLeft === 0) {
      stopRecording()
      setStage("complete")
    }
  }, [stage, timeLeft, stopRecording])

  useEffect(() => {
    if (isRecording) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isRecording])

  const startTest = async () => {
    setStage("preparing")

    // Brief instruction in smaller text
    await speak("Get ready")
    await new Promise((resolve) => setTimeout(resolve, 500))

    await speak("Speak after the beep")
    await playBeep()

    // Start recording and timer
    setStage("active")
    setTimeout(() => {
      startRecording()
    }, 300)
  }

  const handleFinish = async () => {
    if (audioBlob) {
      try {
        const formData = new FormData()
        formData.append("audio", audioBlob, "verbal-fluency.webm")
        formData.append("testType", "verbal-fluency")

        const response = await fetch("/api/verify-audio", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          console.log("[v0] Verbal fluency audio sent successfully")
        }
      } catch (error) {
        console.error("[v0] Error sending audio:", error)
      }
    }

    // Mock score for now
    const score = 5
    onNext(score)
  }

  if (stage === "instruction") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
        <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/20 rounded-2xl mb-6">
              <Mic className="w-12 h-12 text-primary" strokeWidth={2.5} />
            </div>

            <h2 className="text-3xl font-bold mb-6 text-foreground">Speaking Test</h2>

            <p className="text-xl leading-relaxed text-foreground/90 mb-8">
              Name as many kitchen items as you can in 20 seconds.
            </p>

            <div className="space-y-4">
              <Button
                onClick={startTest}
                size="lg"
                className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
              >
                Continue
              </Button>

              <Button
                onClick={() => speak("Name as many kitchen items as you can in 20 seconds")}
                variant="outline"
                size="lg"
                className="w-full h-16 text-lg rounded-2xl"
              >
                <Volume2 className="w-6 h-6 mr-2" />
                Listen Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (stage === "preparing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-lg p-12 rounded-3xl shadow-xl border-2">
          <div className="text-center">
            <Mic className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" strokeWidth={2.5} />
            <p className="text-lg text-foreground/70">Get ready...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (stage === "active") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-lg p-12 md:p-16 rounded-3xl shadow-xl border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="text-center">
            <div className="mb-6">
              {isRecording ? (
                <Mic className="w-16 h-16 text-red-500 mx-auto animate-pulse" strokeWidth={2.5} />
              ) : (
                <Timer className="w-16 h-16 text-primary mx-auto" strokeWidth={2.5} />
              )}
            </div>

            <p className="text-8xl font-bold text-primary mb-8 animate-bounce-in">{timeLeft}</p>

            <p className="text-2xl text-foreground/90 mb-6">Keep naming kitchen items!</p>

            <Button
              onClick={() => {
                stopRecording()
                setStage("complete")
              }}
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg rounded-2xl"
            >
              Stop & Submit
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6">
            <span className="text-4xl">✓</span>
          </div>

          <h2 className="text-3xl font-bold mb-6 text-foreground">Time{"'"}s Up!</h2>

          <p className="text-xl leading-relaxed text-foreground/90 mb-8">Great job naming kitchen items!</p>

          <Button
            onClick={handleFinish}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  )
}
