"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Palette, Volume2, Mic } from "lucide-react"
import { useAudioRecorder } from "@/lib/use-audio-recorder"
import { playBeep } from "@/lib/play-beep"

interface StroopScreenProps {
  onNext: (score: number) => void
}

const colorWords = ["Green", "Red", "Blue", "Yellow", "Purple"]

export function StroopScreen({ onNext }: StroopScreenProps) {
  const [currentWord, setCurrentWord] = useState(0)
  const [score, setScore] = useState(0)
  const [isPreparingToRecord, setIsPreparingToRecord] = useState(false)
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useAudioRecorder()

  useEffect(() => {
    const timer = setTimeout(() => {
      speak("Is this a color word?")
    }, 300)
    return () => {
      clearTimeout(timer)
      window.speechSynthesis.cancel()
    }
  }, [currentWord])

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      console.log("[v0] Starting speech:", text)
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleStartResponse = async () => {
    setIsPreparingToRecord(true)
    window.speechSynthesis.cancel()

    speak("Speak after the beep")

    await new Promise((resolve) => setTimeout(resolve, 2000))
    await playBeep()
    await startRecording()
  }

  const handleSubmitResponse = async () => {
    console.log("[v0] Submitting Stroop response")

    const blob = await stopRecording()
    console.log("[v0] Received audio blob, size:", blob?.size)

    if (blob) {
      try {
        const formData = new FormData()
        formData.append("audio", blob, "response.webm")
        formData.append("word", colorWords[currentWord])
        formData.append("questionType", "stroop")

        console.log("[v0] Sending Stroop audio to backend")
        const response = await fetch("/api/verify-audio", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()
        console.log("[v0] Stroop response verification:", result)

        // Mock: Always count as correct for now
        setScore((prev) => prev + 1)

        clearRecording()
        setIsPreparingToRecord(false)

        if (currentWord < colorWords.length - 1) {
          console.log("[v0] Moving to next Stroop word")
          setCurrentWord((prev) => prev + 1)
        } else {
          console.log("[v0] Stroop test complete, moving to next section")
          onNext(score + 1)
        }
      } catch (error) {
        console.error("[v0] Error submitting stroop response:", error)
      }
    } else {
      console.error("[v0] No audio blob available")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/20 rounded-2xl mb-6">
            <Palette className="w-12 h-12 text-primary" strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Is this a color word?</h2>

          <p className="text-lg text-muted-foreground mb-6">Respond: "This is a color word"</p>

          <div className="mb-8 p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl">
            <p className="text-6xl font-bold text-foreground animate-bounce-in">{colorWords[currentWord]}</p>
          </div>

          {isRecording && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 rounded-2xl animate-pulse">
              <div className="flex items-center justify-center gap-2">
                <Mic className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">Recording...</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!isPreparingToRecord && !isRecording && (
            <Button
              onClick={handleStartResponse}
              size="lg"
              className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              <Mic className="w-6 h-6 mr-2" />
              Tap to Respond
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={handleSubmitResponse}
              size="lg"
              variant="destructive"
              className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              Stop & Submit
            </Button>
          )}

          <Button
            onClick={() => speak("Is this a color word?")}
            variant="outline"
            size="lg"
            className="w-full h-16 text-lg rounded-2xl"
            disabled={isRecording}
          >
            <Volume2 className="w-6 h-6 mr-2" />
            Listen Again
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-4">
            {currentWord + 1} of {colorWords.length}
          </div>
        </div>
      </Card>
    </div>
  )
}
