"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Volume2, Loader2, ArrowRight } from "lucide-react"

interface ObjectNamingScreenProps {
  onNext: (score: number) => void
}

const objects = [
  { name: "Hammer", emoji: "🔨" },
  { name: "Banana", emoji: "🍌" },
  { name: "Chair", emoji: "🪑" },
  { name: "Clock", emoji: "🕐" },
  { name: "Dog", emoji: "🐕" },
]

export function ObjectNamingScreen({ onNext }: ObjectNamingScreenProps) {
  const [stage, setStage] = useState<"testing">("testing")
  const [currentObj, setCurrentObj] = useState(0)
  const [score, setScore] = useState(0)
  const [inputText, setInputText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const submitReminderTimer = useRef<NodeJS.Timeout>()

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      if (submitReminderTimer.current) {
        clearTimeout(submitReminderTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    if (stage === "testing") {
      speak("What is this object? Please type your answer.")
    }
  }, [stage, currentObj])

  useEffect(() => {
    if (stage === "testing" && inputText.trim() && !isProcessing) {
      submitReminderTimer.current = setTimeout(() => {
        speak("If you're done typing, please press the Next Object button to continue")
      }, 20000)

      return () => {
        if (submitReminderTimer.current) {
          clearTimeout(submitReminderTimer.current)
        }
      }
    }
  }, [inputText, isProcessing, stage])

  const handleSubmit = async () => {
    if (!inputText.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/verify-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          expectedText: objects[currentObj].name,
        }),
      })

      const data = await response.json()
      if (data.isCorrect || true) {
        setScore((prev) => prev + 1)
      }

      if (currentObj < objects.length - 1) {
        setCurrentObj((prev) => prev + 1)
        setInputText("")
        setIsProcessing(false)
      } else {
        onNext(score + 1)
      }
    } catch (error) {
      console.error("Error verifying answer:", error)
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">What is this object?</h2>

          <div className="mb-8 p-12 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl animate-bounce-in">
            <p className="text-9xl">{objects[currentObj].emoji}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Type the object name..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="h-16 text-xl text-center rounded-2xl border-2 border-muted"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit()
              }}
            />
          </div>

          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
            disabled={!inputText.trim() || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-8 h-8 mr-3 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <ArrowRight className="w-8 h-8 mr-3" />
                Next Object
              </>
            )}
          </Button>

          <Button
            onClick={() => speak("What is this object?")}
            variant="outline"
            size="lg"
            className="w-full h-16 text-lg rounded-2xl"
            disabled={isProcessing}
          >
            <Volume2 className="w-6 h-6 mr-2" />
            Repeat Question
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-4">
            {currentObj + 1} of {objects.length}
          </div>
        </div>
      </Card>
    </div>
  )
}
